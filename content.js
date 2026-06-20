// content.js
// Injected into the active tab to collect all image URLs

function getAllImages() {
  const seen = new Set();
  const images = [];

  // From <img> tags
  document.querySelectorAll("img").forEach(img => {
    const src = img.src || img.getAttribute("data-src") || img.getAttribute("data-lazy-src");
    if (src && isValidImageUrl(src) && !seen.has(src)) {
      seen.add(src);
      images.push({
        url: src,
        width: img.naturalWidth || img.width || 0,
        height: img.naturalHeight || img.height || 0,
        alt: img.alt || ""
      });
    }

    // srcset
    if (img.srcset) {
      img.srcset.split(",").forEach(entry => {
        const url = entry.trim().split(" ")[0];
        if (url && isValidImageUrl(url) && !seen.has(url)) {
          seen.add(url);
          images.push({ url, width: 0, height: 0, alt: img.alt || "" });
        }
      });
    }
  });

  // From CSS background-image
  document.querySelectorAll("*").forEach(el => {
    const bg = window.getComputedStyle(el).backgroundImage;
    if (bg && bg !== "none") {
      const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
      if (match && match[1] && isValidImageUrl(match[1]) && !seen.has(match[1])) {
        seen.add(match[1]);
        images.push({ url: match[1], width: 0, height: 0, alt: "" });
      }
    }
  });

  // From <picture> and <source>
  document.querySelectorAll("source").forEach(source => {
    const srcset = source.srcset;
    if (srcset) {
      srcset.split(",").forEach(entry => {
        const url = entry.trim().split(" ")[0];
        if (url && isValidImageUrl(url) && !seen.has(url)) {
          seen.add(url);
          images.push({ url, width: 0, height: 0, alt: "" });
        }
      });
    }
  });

  // From <a> links pointing to images
  document.querySelectorAll("a[href]").forEach(a => {
    const href = a.href;
    if (href && isImageExtension(href) && !seen.has(href)) {
      seen.add(href);
      images.push({ url: href, width: 0, height: 0, alt: a.textContent.trim() || "" });
    }
  });

  return images;
}

function isValidImageUrl(url) {
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.protocol.startsWith("http") && isImageExtension(parsed.href);
  } catch {
    return false;
  }
}

function isImageExtension(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff?)(\?.*)?$/i.test(url);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getImages") {
    sendResponse(getAllImages());
  }
  return true;
});
