import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getSetting } from "./config";
import { takeScreenshot } from "./image";

const app = new Hono();

// Global storage for processed images
export const latestImages: Record<string, Buffer> = {};

/**
 * Serves the latest screenshot for a given screen ID
 * Returns PNG image data or 404 if not available
 */
app.get("/image", async (c) => {
  const screenId = c.req.query("screen");
  if (!screenId) {
    return c.text("Screen parameter required", 400);
  }

  if (!latestImages[screenId]) {
    return c.text("Image not found", 404);
  }

  return c.body(Buffer.from(latestImages[screenId]), 200, {
    "Content-Type": "image/png",
  });
});

/**
 * Returns API status information
 */
app.get("/status", async (c) => {
  return c.json({
    numberOfScreens: 0,
  });
});

/**
 * Triggers a manual refresh of a specific screen's screenshot
 * Accepts screen ID as query parameter
 */
app.post("/refresh", async (c) => {
  const screenId = c.req.query("screen");
  if (!screenId) {
    return c.text("Screen parameter required", 400);
  }
  const screens = getSetting("screens");

  const screen = screens.find((s) => s.id === screenId);
  if (!screen) {
    throw new Error(`Screen with id ${screenId} not found`);
  }

  console.log(`Starting refresh for screen: ${screenId}`);

  try {
    const image = await takeScreenshot(screen);
    if (image) {
      latestImages[screenId] = image;
      console.log(`Refresh completed for screen ${screenId}`);
      return c.json({ success: true });
    } else {
      console.log(`Refresh failed for screen ${screenId}`);
      return c.json({ success: false, error: "Screenshot failed" }, 500);
    }
  } catch (error) {
    console.log(
      `Refresh error for screen ${screenId}: ${(error as Error).message}`,
    );
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

/**
 * Starts the HTTP server on port 5000
 * Provides API endpoints for image serving and manual refresh
 */
export async function startServer() {
  serve(
    {
      fetch: app.fetch,
      port: 5000,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    },
  );
}
