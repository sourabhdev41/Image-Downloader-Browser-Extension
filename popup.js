// popup.js

let allImages = [];
let filteredImages = [];

const imagesGrid = document.getElementById("images");
const loadingEl = document.getElementById("loading");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const searchEl = document.getElementById("search");
const minSizeEl = document.getElementById("minSize");
const downloadAllBtn = document.getElementById("downloadAll");
const statusEl = document.getElementById("status");

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadImages();

  searchEl.addEventListener("input", applyFilters);
  minSizeEl.addEventListener("change", applyFilters);
  downloadAllBtn.addEventListener("click", downloadAll);
});

function loadImages() {
  showLoading(true);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, files: ["content.js"] },
      () => {
        if (chrome.runtime.lastError) {
          showError("Cannot access this page.");
          return;
        }

        chrome.tabs.sendMessage(tab.id, { action: "getImages" }, (response) => {
          showLoading(false);

          if (chrome.runtime.lastError || !response) {
            showError("Could not scan this page.");
            return;
          }

          allImages = response;
          applyFilters();
        });
      }
    );
  });
}

function applyFilters() {
  const query = searchEl.value.toLowerCase().trim();
  const minSize = parseInt(minSizeEl.value) || 0;

  filteredImages = allImages.filter(img => {
    const filename = getFilename(img.url).toLowerCase();
    const matchesQuery = !query || filename.includes(query) || img.url.toLowerCase().includes(query);
    const matchesSize = minSize === 0 || img.width >= minSize || img.height >= minSize;
    return matchesQuery && matchesSize;
  });

  renderImages();
}

function renderImages() {
  imagesGrid.innerHTML = "";

  if (filteredImages.length === 0) {
    emptyEl.classList.remove("hidden");
    countEl.textContent = "";
    downloadAllBtn.disabled = true;
    return;
  }

  emptyEl.classList.add("hidden");
  countEl.textContent = filteredImages.length + " image" + (filteredImages.length !== 1 ? "s" : "") + " found";
  downloadAllBtn.disabled = false;

  filteredImages.forEach((img, index) => {
    const card = document.createElement("div");
    card.className = "image-card";

    const filename = getFilename(img.url);
    const sizeText = (img.width && img.height) ? `${img.width}x${img.height}` : "";

    card.innerHTML = `
      <div class="thumb-wrap">
        <img src="${escHtml(img.url)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'no-preview\\'>No preview</div>'" />
      </div>
      <div class="card-meta">
        <div class="card-filename" title="${escHtml(filename)}">${escHtml(filename)}</div>
        ${sizeText ? `<div>${sizeText}</div>` : ""}
      </div>
      <div class="card-actions">
        <button class="btn-small" data-index="${index}">Download</button>
      </div>
    `;

    card.querySelector(".btn-small").addEventListener("click", () => {
      downloadImage(img.url, filename);
    });

    imagesGrid.appendChild(card);
  });
}

function downloadImage(url, filename) {
  chrome.runtime.sendMessage(
    { action: "download", url, filename },
    (response) => {
      if (response && response.success) {
        showStatus("Downloading: " + filename, "success");
      } else {
        showStatus("Failed to download: " + filename, "error");
      }
    }
  );
}

function downloadAll() {
  if (filteredImages.length === 0) return;

  const urls = filteredImages.map(img => img.url);

  downloadAllBtn.disabled = true;
  downloadAllBtn.textContent = "Downloading...";

  chrome.runtime.sendMessage(
    { action: "downloadAll", urls },
    (response) => {
      downloadAllBtn.disabled = false;
      downloadAllBtn.textContent = "Download All";

      if (response && response.success) {
        showStatus("Started downloading " + response.total + " images.", "success");
      } else {
        showStatus("Some downloads may have failed.", "error");
      }
    }
  );
}

function showLoading(show) {
  loadingEl.classList.toggle("hidden", !show);
  imagesGrid.classList.toggle("hidden", show);
}

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = "status " + (type || "");
  statusEl.classList.remove("hidden");
  setTimeout(() => statusEl.classList.add("hidden"), 3000);
}

function showError(msg) {
  loadingEl.classList.add("hidden");
  emptyEl.classList.remove("hidden");
  emptyEl.querySelector("p").textContent = msg;
}

function getFilename(url) {
  try {
    const path = new URL(url).pathname;
    const parts = path.split("/");
    const last = parts[parts.length - 1];
    return last && last.length > 0 ? decodeURIComponent(last) : "image.jpg";
  } catch {
    return "image.jpg";
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
