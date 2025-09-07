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
- **E-paper Optimization**: Processes images with rotation, grayscale conversion, and PNG optimization for e-paper displays
- **HTTP API**: Provides RESTful endpoints for e-paper devices to retrieve processed images
- **Configurable Updates**: Set custom update intervals with automatic scheduling
- **Multiple Display Sizes**: Support for various e-paper display resolutions with custom scaling
\- **Flexible Configuration**: Support for rotation, scaling, rendering delays, and color scheme preferences

## Installation

See [DOCS.md](DOCS.md) for Home Assistant add-on installation and configuration instructions.

## Development

This add-on is built with TypeScript and Node.js, using modern tools for reliable screenshot capture and image processing.

### Tech Stack

- **TypeScript**: Type-safe development
- **Puppeteer**: Headless browser automation for screenshot capture
- **Sharp**: High-performance image processing
- **Hono**: Lightweight web framework for API endpoints

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting and formatting
npm run lint
```

## Support

For issues and feature requests, please use the [GitHub repository issues section](https://github.com/Soneliem/hass-addons/issues).

[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-green.svg
[amd64-shield]: https://img.shields.io/badge/amd64-yes-green.svg
[armhf-shield]: https://img.shields.io/badge/armhf-yes-green.svg
[armv7-shield]: https://img.shields.io/badge/armv7-yes-green.svg
[i386-shield]: https://img.shields.io/badge/i386-yes-green.svg
