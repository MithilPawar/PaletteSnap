import { showToast } from '../../core/utils.js';

export function isValidImageUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function loadFile(file, onReady) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => onReady(img, e.target.result, file.name);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

export function loadUrl(url, onReady, onStart, onDone, onError) {
  onStart();

  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    const name = url.split('/').pop() || 'image';
    onReady(img, url, name);
    onDone();
  };

  img.onerror = () => {
    onDone();
    if (onError) {
      onError('Could not load image from URL. Check the link or upload the file directly.');
      return;
    }
    showToast('Could not load image from URL. Check the link or upload the file directly.');
  };

  img.src = url;
}
