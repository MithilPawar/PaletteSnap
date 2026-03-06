import { processImage } from './extractor.js';
import { loadFile, loadUrl } from './image-loader.js';
import { appState } from './state.js';
import {
  renderPalette,
  renderStats,
  setDimensions,
  setFilename,
  setLoaderVisible,
  setPreviewImage,
  wireActions
} from './ui.js';
import { showToast } from './utils.js';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const urlInput = document.getElementById('urlInput');
const urlBtn = document.getElementById('urlBtn');
const canvas = document.getElementById('canvas');

function processAndRender(img) {
  setLoaderVisible(true);
  appState.currentImgEl = img;

  setTimeout(() => {
    const result = processImage(img, appState.colorCount, canvas);
    appState.currentColors = result.colors;

    if (!result.colors.length) {
      setLoaderVisible(false);
      showToast('No visible pixels found in image.');
      return;
    }

    setDimensions(result.width, result.height);
    renderPalette(result.colors);
    renderStats(result.colors);
    setLoaderVisible(false);
  }, 50);
}

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;

  loadFile(file, (img, src, name) => {
    setPreviewImage(src);
    setFilename(name);
    processAndRender(img);
  });
}

function handleUrl() {
  const url = urlInput.value.trim();
  if (!url) return;

  loadUrl(
    url,
    (img, src, name) => {
      setPreviewImage(src);
      setFilename(name);
      processAndRender(img);
    },
    () => setLoaderVisible(true),
    () => setLoaderVisible(false)
  );
}

function resetApp() {
  document.getElementById('preview-section').style.display = 'none';
  urlInput.value = '';
  fileInput.value = '';
  appState.currentColors = [];
  appState.currentImgEl = null;
}

function bindColorCountButtons() {
  document.querySelectorAll('.color-count-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-count-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      appState.colorCount = parseInt(btn.dataset.count, 10);
      if (appState.currentImgEl) processAndRender(appState.currentImgEl);
    });
  });
}

function bindDnD() {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
  });
}

function bindInputs() {
  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
  urlBtn.addEventListener('click', handleUrl);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUrl();
  });
}

function getCurrentColors() {
  return appState.currentColors;
}

bindColorCountButtons();
bindDnD();
bindInputs();
wireActions(getCurrentColors, resetApp);
