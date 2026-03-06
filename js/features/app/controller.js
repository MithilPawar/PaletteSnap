import { appState } from '../../core/state.js';
import { showToast } from '../../core/utils.js';
import { wirePaletteActions } from '../export/palette-actions.js';
import { isValidImageUrl, loadFile, loadUrl } from '../import/image-loader.js';
import { processImage } from '../palette/extractor.js';
import {
  renderAccessibilityAudit,
  renderPalette,
  renderStats,
  setDimensions,
  setFilename,
  setLoaderVisible,
  setPreviewImage
} from '../palette/view.js';

export function initApp() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const urlInput = document.getElementById('urlInput');
  const urlBtn = document.getElementById('urlBtn');
  const canvas = document.getElementById('canvas');
  const actions = wirePaletteActions(getCurrentColors, resetApp);

  function processAndRender(img) {
    setLoaderVisible(true);
    appState.currentImgEl = img;

    setTimeout(() => {
      let result;
      try {
        result = processImage(img, appState.colorCount, canvas);
      } catch (error) {
        setLoaderVisible(false);
        showToast(error.message || 'Could not extract colors from this image.');
        actions.setActionsEnabled(false);
        return;
      }

      appState.currentColors = result.colors;

      if (!result.colors.length) {
        setLoaderVisible(false);
        showToast('No visible pixels found in image.');
        actions.setActionsEnabled(false);
        return;
      }

      setDimensions(result.width, result.height);
      renderPalette(result.palette);
      renderStats(result.colors);
      renderAccessibilityAudit(result.colors);
      actions.setActionsEnabled(true);
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

    if (!isValidImageUrl(url)) {
      showToast('Please enter a valid image URL starting with http:// or https://');
      return;
    }

    loadUrl(
      url,
      (img, src, name) => {
        setPreviewImage(src);
        setFilename(name);
        processAndRender(img);
      },
      () => setLoaderVisible(true),
      () => setLoaderVisible(false),
      (message) => showToast(message)
    );
  }

  function resetApp() {
    document.getElementById('preview-section').style.display = 'none';
    urlInput.value = '';
    fileInput.value = '';
    appState.currentColors = [];
    appState.currentImgEl = null;
    actions.setActionsEnabled(false);
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
}
