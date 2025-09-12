/**
 * Configuration interface for the dashboard2epaper addon
 */
export interface AddonConfig {
  base_url: string;
  access_token: string;
  screens: Screen[];
  language: string;
  rendering_timeout: number;
  browser_launch_timeout: number;
  ignore_certificate_errors: boolean;
}

/**
 * Screen configuration interface defining display parameters
 */
export interface Screen {
  id: string;
  path: string;
  update_interval: number;
  width: number;
  height: number;
  rotation: number;
  scaling: number;
  rendering_delay: number;
  prefers_color_scheme: string;
}
