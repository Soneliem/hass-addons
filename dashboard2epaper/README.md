# Dashboard2EPaper Add-on

![Supports aarch64 Architecture][aarch64-shield]
![Supports amd64 Architecture][amd64-shield]
![Supports armhf Architecture][armhf-shield]
![Supports armv7 Architecture][armv7-shield]
![Supports i386 Architecture][i386-shield]

Capture Home Assistant dashboards and serve optimized images for e-paper displays.

## About

Dashboard2EPaper is a Home Assistant add-on that captures screenshots of your dashboards and processes them for optimal display on e-paper devices. The add-on provides an HTTP API that e-paper devices can poll to get the latest processed images.

## Features

- **Dashboard Screenshot Capture**: Automatically captures screenshots of specified Home Assistant dashboards
- **E-paper Optimization**: Processes images with grayscale conversion, dithering, and contrast adjustment
- **HTTP API**: Provides RESTful endpoints for e-paper devices to retrieve processed images
- **Configurable Updates**: Set custom update intervals from 1 minute to 24 hours
- **Multiple Display Sizes**: Support for various e-paper display resolutions
- **Access Token Support**: Optional authentication for private dashboards

## Installation

1. Add this repository to your Home Assistant supervisor
2. Install the "Dashboard2EPaper" add-on
3. Configure the add-on options
4. Start the add-on

## Configuration

### Option Details

- `dashboard_url`: URL of the Home Assistant dashboard to capture
- `update_interval`: How often to capture screenshots (1-1440 minutes)
- `display_width`: Target width for the e-paper display (100-2000 pixels)
- `display_height`: Target height for the e-paper display (100-2000 pixels)
- `dithering`: Enable Floyd-Steinberg dithering for better e-paper display
- `contrast_adjustment`: Adjust image contrast (0.1-3.0, where 1.0 is normal)
- `access_token`: Home Assistant long-lived access token (optional)
- `log_level`: Logging level (debug, info, warn, error)

## API Endpoints

The following endpoints are available:

- `GET /api/image` - Latest processed e-paper image (PNG format)
- `GET /api/status` - Service health and statistics
- `GET /api/config` - Current configuration (sanitized)
- `POST /api/refresh` - Force immediate screenshot update

## Development

This add-on is built with TypeScript and Node.js. For development:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Support

For issues and feature requests, please use the GitHub repository issues section.

[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-green.svg
[amd64-shield]: https://img.shields.io/badge/amd64-yes-green.svg
[armhf-shield]: https://img.shields.io/badge/armhf-yes-green.svg
[armv7-shield]: https://img.shields.io/badge/armv7-yes-green.svg
[i386-shield]: https://img.shields.io/badge/i386-yes-green.svg
