// background.js
// Handles download requests from the popup

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download") {
    const url = request.url;
    const filename = request.filename || getFilenameFromUrl(url);

    chrome.downloads.download({
      url: url,
      filename: "image-downloader/" + filename,
      conflictAction: "uniquify"
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId });
      }
    });

    return true; // Keep message channel open for async response
  }

  if (request.action === "downloadAll") {
    const urls = request.urls;
    let count = 0;

    urls.forEach((url, index) => {
      setTimeout(() => {
        const filename = getFilenameFromUrl(url) || `image-${index + 1}.jpg`;
        chrome.downloads.download({
          url: url,
          filename: "image-downloader/" + filename,
          conflictAction: "uniquify"
        });
        count++;
        if (count === urls.length) {
          sendResponse({ success: true, total: count });
        }
      }, index * 200); // stagger downloads slightly
    });

    return true;
  }
});

function getFilenameFromUrl(url) {
  try {
    const parts = new URL(url).pathname.split("/");
    const last = parts[parts.length - 1];
    return last && last.includes(".") ? last : "image.jpg";
  } catch {
    return "image.jpg";
  }
}
