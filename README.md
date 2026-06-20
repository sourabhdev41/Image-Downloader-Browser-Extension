# Image Downloader — Chrome Extension

A lightweight Chrome extension that scans any webpage and lets you download images individually or all at once.

## Features

- Detects all images on the current page
- Thumbnail preview for each image
- Filter images by filename or URL
- Filter by minimum image size
- Download individual images
- Download all images with one click
- Duplicate filtering
- Clean black and white minimal UI

## How It Works

Click the extension icon on any page. The popup scans the page for images from:

- `<img>` tags (including `srcset` and lazy-load attributes)
- CSS background images
- `<picture>` and `<source>` elements
- `<a>` links pointing to image files

## Screenshots

<img width="2934" height="1594" alt="image" src="https://github.com/user-attachments/assets/e18d1607-ef22-4b55-aedd-adbe63f5d64c" />
<img width="804" height="618" alt="image" src="https://github.com/user-attachments/assets/2ec864df-6410-40b2-ad0a-39748f51b8da" />


## Installation

### Load in Chrome (Developer Mode)

1. Download or clone this repository

```bash
git clone https://github.com/sourabhdev41/image-downloader-extension.git
```

2. Open Chrome and go to:

```
chrome://extensions/
```

3. Enable **Developer Mode** (toggle in the top right)

4. Click **Load Unpacked**

5. Select the `image-downloader-extension` folder

6. The extension icon appears in the toolbar

### Usage

1. Open any webpage
2. Click the Image Downloader icon
3. The popup lists all detected images with thumbnails
4. Use the search box to filter by name or URL
5. Use the size filter to exclude small images like icons
6. Click **Download** on any image, or **Download All**

Downloaded files are saved to your default downloads folder under `image-downloader/`.

## File Structure

```
image-downloader-extension/
│
├── manifest.json       Chrome extension config
├── background.js       Service worker, handles downloads
├── content.js          Injected script, scans the page
├── popup.html          Extension popup markup
├── popup.css           Popup styles
├── popup.js            Popup logic
├── icon16.png
├── icon48.png
├── icon128.png
└── README.md
```

## Permissions Used

| Permission | Reason |
|---|---|
| `activeTab` | Access the current tab to scan images |
| `scripting` | Inject content script into the page |
| `downloads` | Save images to the user's device |

## Planned Features

- Download all as ZIP
- Show image dimensions
- Detect lazy-loaded images after scroll
- Filter by file type (jpg, png, gif, etc.)
- Dark mode

## Tech Stack

- HTML
- CSS
- JavaScript
- Chrome Extensions API (Manifest V3)

## License

MIT License.
