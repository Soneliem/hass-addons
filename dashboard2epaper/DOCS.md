# Home Assistant Add-on: Dashboard2EPaper

Capture Home Assistant dashboards and serve optimized images for e-paper displays.

## How to use

1. Configure your Home Assistant URL and access token
2. Add your dashboard screens to capture
3. Start the add-on
4. Access images at `http://homeassistant.local:5000/api/image?screen=your_screen_id`

## Configuration

### Basic Example

```yaml
base_url: "http://192.168.1.100:8123"
access_token: "your_long_lived_access_token"
screens:
  - id: "kitchen"
    path: "/lovelace/0"
    width: 800
    height: 600
    update_interval: 300
```

### Options

**base_url** (required): Your Home Assistant URL  
**access_token** (required): Long-lived access token from your HA profile  
**screens** (required): List of dashboards to capture

#### Screen Options

- **id**: Unique name for this screen
- **path**: Dashboard path (e.g., `/lovelace/0`)
- **width/height**: Image size in pixels
- **update_interval**: How often to update (seconds)
- **rotation**: Rotate image (0, 90, 180, 270 degrees)
- **scaling**: Scale factor (e.g., 1.0 = 100%)

## API

Get latest image: `GET /image?screen=your_screen_id`  
Force refresh: `POST /refresh?screen=your_screen_id`  
Status: `GET /status`

The add-on runs on port 5000 or as configured.
