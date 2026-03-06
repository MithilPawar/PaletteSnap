import { showToast } from '../../core/utils.js';

export function loadFile(file, onReady) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => onReady(img, e.target.result, file.name);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

export function loadUrl(url, onReady, onStart, onDone) {
  onStart();

  const proxied = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    const name = url.split('/').pop() || 'image';
    onReady(img, img.src, name);
    onDone();
  };

  img.onerror = () => {
    onDone();
    showToast('Could not load image. Try uploading directly.');
  };

  img.src = proxied;
}
