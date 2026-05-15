// Insert the published Power BI URL here when it exists.
// Example: const POWER_BI_PUBLIC_URL = "https://app.powerbi.com/view?r=...";
const POWER_BI_PUBLIC_URL = "https://app.powerbi.com/links/dDtG6tcH2S?ctid=8e75bb8c-2244-490b-876e-c9a9fcb2ef63&pbi_source=linkShare";
const POWER_BI_QR_FALLBACK_IMAGE = "assets/qr_powerbi_relatorio.png";

const slides = Array.from(document.querySelectorAll(".slide"));
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const slideCounter = document.getElementById("slideCounter");
const progressBar = document.getElementById("progressBar");
const imageZoomOverlay = document.getElementById("imageZoomOverlay");
const imageZoomPreview = document.getElementById("imageZoomPreview");
const imageZoomTitle = document.getElementById("imageZoomTitle");

let slideIndex = getInitialSlideIndex();
let stepIndex = 0;
const urlParams = new URLSearchParams(window.location.search);
const revealAllForReview = urlParams.has("showAll");

function getInitialSlideIndex() {
  const hashNumber = Number.parseInt(window.location.hash.replace("#", ""), 10);
  if (Number.isFinite(hashNumber) && hashNumber >= 1 && hashNumber <= slides.length) {
    return hashNumber - 1;
  }
  return 0;
}

function revealItems(slide) {
  return Array.from(slide.querySelectorAll(".reveal"));
}

function activateSlide(index, mode = "reset") {
  slideIndex = Math.max(0, Math.min(index, slides.length - 1));
  hideDashboardZoom();

  slides.forEach((slide, currentIndex) => {
    slide.classList.toggle("active", currentIndex === slideIndex);
    revealItems(slide).forEach((item) => item.classList.remove("visible"));
  });

  const reveals = revealItems(slides[slideIndex]);
  if (mode === "all") {
    reveals.forEach((item) => item.classList.add("visible"));
    stepIndex = reveals.length;
  } else {
    stepIndex = 0;
  }

  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${slideIndex + 1}`);
  updateUi();
}

function nextStep() {
  const reveals = revealItems(slides[slideIndex]);
  if (stepIndex < reveals.length) {
    reveals[stepIndex].classList.add("visible");
    stepIndex += 1;
    updateUi();
    return;
  }

  if (slideIndex < slides.length - 1) {
    activateSlide(slideIndex + 1);
  }
}

function previousStep() {
  const reveals = revealItems(slides[slideIndex]);
  if (stepIndex > 0) {
    stepIndex -= 1;
    reveals[stepIndex].classList.remove("visible");
    updateUi();
    return;
  }

  if (slideIndex > 0) {
    activateSlide(slideIndex - 1, "all");
  }
}

function updateUi() {
  slideCounter.textContent = `${slideIndex + 1} / ${slides.length}`;
  progressBar.style.width = `${((slideIndex + 1) / slides.length) * 100}%`;
  document.title = `${slides[slideIndex].dataset.title} - Business Intelligence in Global Geopolitics`;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function renderPowerBiQr() {
  const mount = document.getElementById("qrMount");
  const status = document.getElementById("qrStatus");
  const url = POWER_BI_PUBLIC_URL.trim();
  const hasUrl = url.length > 0 && !url.includes("POWER_BI_PUBLIC_URL");

  if (!mount || !status) return;

  if (!hasUrl) {
    mount.innerHTML = `<div class="qr-placeholder">QR<br>PLACEHOLDER</div>`;
    status.textContent = "Edit script.js and set POWER_BI_PUBLIC_URL";
    return;
  }

  if (typeof qrcode !== "function") {
    mount.innerHTML = `<img class="qr-fallback-image" src="${POWER_BI_QR_FALLBACK_IMAGE}" alt="QR code for the Power BI public report">`;
    status.textContent = url;
    return;
  }

  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();
  mount.innerHTML = qr.createSvgTag({
    scalable: true,
    margin: 2,
    cellSize: 6,
    title: "Power BI public report",
    alt: "QR code for the Power BI public report"
  });
  status.innerHTML = `<a href="${url}" target="_blank" rel="noreferrer">Open Power BI report</a>`;
}

function showDashboardZoom(image, title = "") {
  if (!imageZoomOverlay || !imageZoomPreview || !image) return;
  imageZoomPreview.src = image.currentSrc || image.src;
  imageZoomPreview.alt = image.alt || "Enlarged Power BI dashboard screenshot";
  if (imageZoomTitle) {
    imageZoomTitle.textContent = title || image.alt || "Power BI dashboard";
  }
  imageZoomOverlay.classList.add("visible");
}

function hideDashboardZoom() {
  imageZoomOverlay?.classList.remove("visible");
}

function setupDashboardZoom() {
  const dashboardTiles = Array.from(document.querySelectorAll(".dashboard-grid .dash-tile"));
  dashboardTiles.forEach((tile) => {
    const image = tile.querySelector("img");
    const title = tile.querySelector("strong")?.textContent?.trim() || "";
    tile.addEventListener("mouseenter", () => showDashboardZoom(image, title));
    tile.addEventListener("mouseleave", hideDashboardZoom);
    tile.addEventListener("focusin", () => showDashboardZoom(image, title));
    tile.addEventListener("focusout", hideDashboardZoom);
  });
}

function showZoomPreviewFromQuery() {
  const previewIndex = Number.parseInt(urlParams.get("zoomTile") || "", 10);
  const dashboardTiles = Array.from(document.querySelectorAll(".dashboard-grid .dash-tile"));
  if (Number.isFinite(previewIndex) && previewIndex >= 1 && previewIndex <= dashboardTiles.length) {
    const tile = dashboardTiles[previewIndex - 1];
    showDashboardZoom(tile.querySelector("img"), tile.querySelector("strong")?.textContent?.trim() || "");
  }
}

nextBtn.addEventListener("click", nextStep);
prevBtn.addEventListener("click", previousStep);
fullscreenBtn.addEventListener("click", toggleFullscreen);

document.addEventListener("keydown", (event) => {
  const forwardKeys = ["ArrowRight", "PageDown", " ", "Enter"];
  const backwardKeys = ["ArrowLeft", "PageUp", "Backspace"];

  if (forwardKeys.includes(event.key)) {
    event.preventDefault();
    nextStep();
  }

  if (backwardKeys.includes(event.key)) {
    event.preventDefault();
    previousStep();
  }

  if (event.key.toLowerCase() === "f") {
    event.preventDefault();
    toggleFullscreen();
  }
});

document.addEventListener("click", (event) => {
  const isControl = event.target.closest(".deck-ui, a, button");
  if (!isControl) {
    nextStep();
  }
});

renderPowerBiQr();
setupDashboardZoom();
activateSlide(slideIndex, revealAllForReview ? "all" : "reset");
showZoomPreviewFromQuery();
