import * as fs from "node:fs";
import type { AddonConfig } from "./types";

let config: AddonConfig | null = null;

/**
 * Loads configuration from options.json file
 * Must be called before using getSetting()
 */
export async function loadConfig() {
  try {
    const configData = JSON.parse(
      fs.readFileSync("/data/options.json", "utf8"),
      // fs.readFileSync("options.json", "utf8"),
    );
    config = configData as AddonConfig;
    console.log("Configuration loaded successfully");
  } catch (error) {
    throw new Error(
      `Failed to load configuration: ${(error as Error).message}`,
    );
  }
}

/**
 * Retrieves a configuration setting by key
 * @param key - The configuration key to retrieve
 * @returns The configuration value for the specified key
 * @throws Error if configuration is not loaded
 */
export function getSetting<AddonKey extends keyof AddonConfig>(key: AddonKey) {
  if (!config) {
    throw new Error("Configuration not loaded");
  }
  return config[key];
}
