import { latestImages, startServer } from "./api";
import { getSetting, loadConfig } from "./config";
import { closeBrowser, initializeBrowser, takeScreenshot } from "./image";
import type { Screen } from "./types";

/**
 * Main application entry point
 * Initializes configuration, browser, and starts the screenshot monitoring service
 */
async function main() {
  try {
    // Load configuration settings
    await loadConfig();

    // Initialize the browser with authentication
    await initializeBrowser();

    const screens = getSetting("screens");
    console.log(`Found ${screens.length} screen(s) to monitor`);
    // Schedule periodic screenshot updates for each screen
    for (const screen of screens) {
      setInterval(async () => {
        requestScreenshots(screen);
      }, screen.update_interval * 1000);
      // Initial screenshot request
      requestScreenshots(screen);
    }

    // Start the HTTP server
    await startServer();
  } catch (error) {
    console.error("Failed to start server:", error);
    await closeBrowser();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  await closeBrowser();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await closeBrowser();
  process.exit(0);
});

/**
 * Captures a screenshot for a specific screen and updates the global image cache
 * @param screen - Screen configuration to capture
 */
async function requestScreenshots(screen: Screen) {
  try {
    const image = await takeScreenshot(screen);
    if (image) {
      latestImages[screen.id] = image;
      console.log(`Successfully updated screenshot for screen ${screen.id}`);
    } else {
      console.error(`Failed to capture screenshot for screen ${screen.id}`);
    }
  } catch (error) {
    console.error(`Error updating screenshot for screen ${screen.id}:`, error);
  }
}

main();
