import { setTimeout } from "node:timers/promises";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import sharp from "sharp";
import { getSetting } from "./config";
import type { Screen } from "./types";

// Global browser instance management
let sharedBrowser: Browser | null = null;

/**
 * Processes a screenshot buffer by applying rotation, grayscale conversion, and PNG optimization
 * @param buffer - The raw screenshot buffer
 * @param screen - Screen configuration containing rotation settings
 * @returns Processed image buffer ready for display
 */
async function processImage(
  buffer: Uint8Array,
  screen: Screen,
): Promise<Buffer> {
  const processed = await sharp(Buffer.from(buffer))
    .rotate(screen.rotation || 0)
    .grayscale()
    .png({ colours: 16 })
    .toBuffer();
  return processed;
}

/**
 * Initializes a shared Puppeteer browser instance with Home Assistant authentication
 * Sets up browser with required flags and authenticates with the provided access token
 */
export async function initializeBrowser(): Promise<void> {
  const baseUrl = getSetting("base_url");
  const accessToken = getSetting("access_token");
  const language = getSetting("language");
  const browserLaunchTimeout = getSetting("browser_launch_timeout") * 1000;
  const renderingTimeout = getSetting("rendering_timeout") * 1000;
  const ignoreCertificateErrors = getSetting("ignore_certificate_errors");

  console.log("Launching new browser instance...");
  const browser = await puppeteer.launch({
    args: [
      "--disable-dev-shm-usage",
      "--no-sandbox",
      `--lang=${language}`,
      ignoreCertificateErrors && "--ignore-certificate-errors",
    ].filter((x) => x),
    defaultViewport: null,
    timeout: browserLaunchTimeout,
    headless: true,
    executablePath: "/usr/bin/chromium-browser",
  });

  // Handle browser disconnection
  browser.on("disconnected", () => {
    console.log("Browser disconnected");
    sharedBrowser = null;
  });

  const hassTokens = {
    hassUrl: baseUrl,
    access_token: accessToken,
    token_type: "Bearer",
  };

  console.log(`Visiting '${baseUrl}' to login...`);
  const loginPage = await browser.newPage();

  try {
    await loginPage.goto(baseUrl, {
      waitUntil: "domcontentloaded",
      timeout: renderingTimeout,
    });

    // Wait a moment for the page to stabilize
    await setTimeout(1000);

    console.log("Adding authentication entry to browser's local storage...");

    // Check if page is still available before executing JavaScript
    if (!loginPage.isClosed()) {
      await loginPage.evaluate(
        (hassTokens, selectedLanguage) => {
          localStorage.setItem("hassTokens", hassTokens);
          localStorage.setItem("selectedLanguage", selectedLanguage);
        },
        JSON.stringify(hassTokens),
        JSON.stringify(language),
      );
    }
  } catch (error) {
    console.warn("Warning during browser login process:", error.message);
    // Continue with browser initialization even if there are navigation issues
  }

  await loginPage.close();
  console.log("Browser initialized!");

  sharedBrowser = browser;
}

/**
 * Captures a screenshot of the specified screen configuration
 * Handles browser initialization, page setup, and error recovery
 * @param screen - Screen configuration with dimensions, path, and display settings
 * @returns Processed screenshot buffer or null if capture fails
 */
export async function takeScreenshot(screen: Screen): Promise<Buffer | null> {
  const baseUrl = getSetting("base_url");
  const renderingTimeout = getSetting("rendering_timeout") * 1000;
  const url = `${baseUrl}${screen.path}`;

  let page: Page;
  try {
    // Reinitialize browser if it's not available or disconnected
    if (!sharedBrowser || !sharedBrowser.connected) {
      console.log("Browser not available, reinitializing...");
      await initializeBrowser();
    }

    page = await sharedBrowser.newPage();
    await page.emulateMediaFeatures([
      {
        name: "prefers-color-scheme",
        value: `${screen.prefers_color_scheme}`,
      },
    ]);

    let size = {
      width: screen.width,
      height: screen.height,
    };

    if (screen.rotation % 180 > 0) {
      size = {
        width: size.height,
        height: size.width,
      };
    }

    await page.setViewport(size);
    const startTime = Date.now();
    await page.goto(url, {
      waitUntil: ["domcontentloaded", "load", "networkidle0"],
      timeout: renderingTimeout,
    });

    const navigateTimespan = Date.now() - startTime;

    // Try to wait for home-assistant element, but continue if it times out
    try {
      await page.waitForSelector("home-assistant", {
        timeout: Math.max(renderingTimeout - navigateTimespan, 1000),
      });
    } catch (selectorError) {
      console.warn(
        `home-assistant selector not found, continuing anyway: ${selectorError.message}`,
      );
      // Wait a bit for the page to settle
      await setTimeout(2000);
    }

    await page.addStyleTag({
      content: `
        body {
          zoom: ${screen.scaling * 100}%;
          overflow: hidden;
        }`,
    });

    if (screen.rendering_delay > 0) {
      await setTimeout(screen.rendering_delay);
    }
    const screenshotBuffer = await page.screenshot({
      type: "png",
      captureBeyondViewport: false,
      clip: {
        x: 0,
        y: 0,
        ...size,
      },
    });

    return await processImage(screenshotBuffer, screen);
  } catch (error) {
    console.error("Failed to render", error);
    return null;
  } finally {
    if (page) {
      await page.close();
    }
  }
}

/**
 * Gracefully closes the shared browser instance
 * Should be called during application shutdown to free resources
 */
export async function closeBrowser(): Promise<void> {
  if (sharedBrowser?.connected) {
    console.log("Closing shared browser...");
    await sharedBrowser.close();
    sharedBrowser = null;
  }
}
