import { showToast } from '../../core/utils.js';

const IMAGE_EXTENSIONS_REGEX = /\.(png|jpe?g|webp|gif|bmp|svg|avif|ico|tiff?)(?:$|[?#])/i;

export function validateImageUrl(url) {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        reason: 'URL must start with http:// or https://'
      };
    }

    const urlForExtensionCheck = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (!IMAGE_EXTENSIONS_REGEX.test(urlForExtensionCheck)) {
      return {
        valid: false,
        reason: 'Please use a direct image URL ending in .png, .jpg, .jpeg, .webp, .gif, .svg, or .avif'
      };
    }

    return {
      valid: true,
      normalizedUrl: parsed.toString()
    };
  } catch {
    return {
      valid: false,
      reason: 'Please enter a valid URL'
    };
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
