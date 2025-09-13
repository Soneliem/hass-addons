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
    .rotate(screen.rotation)
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
    // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  const hassTokens = {
    hassUrl: baseUrl,
    access_token: accessToken,
    token_type: "Bearer",
  };

  console.log("Setting up authentication for all pages...");

  // Create a temporary page to set up authentication tokens for the entire browser context
  const setupPage = await browser.newPage();

  // Set up authentication tokens to be injected on every page load
  await setupPage.evaluateOnNewDocument(
    (hassTokens, selectedLanguage) => {
      localStorage.setItem("hassTokens", hassTokens);
      localStorage.setItem("selectedLanguage", selectedLanguage);
    },
    JSON.stringify(hassTokens),
    JSON.stringify(language),
  );

  // Navigate to the base URL to initialize the domain context for localStorage
  await setupPage.goto(baseUrl, {
    timeout: renderingTimeout,
  });
  await setupPage.close();

  console.log("Authentication tokens configured for browser context.");
  sharedBrowser = browser;
  console.log("Browser initialized!");
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

  let page: Page | undefined;
  try {
    // Check if browser is available, but don't reinitialize during operations
    if (!sharedBrowser || !sharedBrowser.connected) {
      throw new Error(
        "Browser not available or disconnected. Browser must be initialized before taking screenshots.",
      );
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
    await page.waitForSelector("home-assistant", {
      timeout: Math.max(renderingTimeout - navigateTimespan, 1000),
    });

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
    if (page && !page.isClosed()) {
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
    try {
      await sharedBrowser.close();
    } catch (error) {
      console.warn("Error closing browser:", error.message);
    }
    sharedBrowser = null;
  }
}
