import { copyText, getLuminance, showToast, toHex } from './utils.js';

export function setLoaderVisible(show) {
  document.getElementById('loader').style.display = show ? 'block' : 'none';
  document.getElementById('preview-section').style.display = show ? 'none' : 'block';
}

export function setPreviewImage(src) {
  document.getElementById('previewImg').src = src;
}

export function setFilename(name) {
  document.getElementById('filename').textContent = name;
}

export function setDimensions(width, height) {
  document.getElementById('dimensions').textContent = `${width} x ${height}px`;
}

export function renderPalette(colors) {
  const strip = document.getElementById('paletteStrip');
  strip.innerHTML = '';

  colors.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'palette-strip-color';
    div.style.background = `rgb(${c[0]},${c[1]},${c[2]})`;
    div.title = toHex(c);
    div.onclick = () => {
      copyText(toHex(c));
      showToast(`Copied ${toHex(c)}`);
    };
    strip.appendChild(div);
  });

  const grid = document.getElementById('paletteGrid');
  grid.innerHTML = '';

  colors.forEach((c, i) => {
    const hex = toHex(c);
    const lum = getLuminance(c);
    const textColor = lum > 128 ? '#1a1a1a' : '#f0f0f0';

    const card = document.createElement('div');
    card.className = 'color-card';
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="color-swatch" style="background:rgb(${c[0]},${c[1]},${c[2]})">
        <div class="copy-hint" style="color:${textColor}">CLICK TO COPY</div>
      </div>
      <div class="color-info">
        <div class="color-hex">${hex}</div>
        <div class="color-rgb">rgb(${c[0]}, ${c[1]}, ${c[2]})</div>
      </div>`;

    card.onclick = () => {
      copyText(hex);
      showToast(`Copied ${hex}!`);
    };
    grid.appendChild(card);
  });

  document.getElementById('preview-section').style.display = 'block';
}

export function renderStats(colors) {
  const avgLum = colors.reduce((sum, c) => sum + getLuminance(c), 0) / colors.length;
  const tone = avgLum > 200 ? 'Light' : avgLum > 100 ? 'Balanced' : 'Dark';

  const hues = colors.map(([r, g, b]) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min) return 0;

    const d = max - min;
    let h = 0;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return h * 60;
  });

  const hueRange = Math.max(...hues) - Math.min(...hues);
  const variety = hueRange > 180 ? 'Diverse' : hueRange > 90 ? 'Varied' : 'Monochromatic';

  document.getElementById('statsRow').innerHTML = `
    <div class="stat"><div class="stat-label">COLORS</div><div class="stat-value">${colors.length}</div></div>
    <div class="stat"><div class="stat-label">TONE</div><div class="stat-value">${tone}</div></div>
    <div class="stat"><div class="stat-label">VARIETY</div><div class="stat-value">${variety}</div></div>
    <div class="stat"><div class="stat-label">AVG BRIGHTNESS</div><div class="stat-value">${Math.round(avgLum)}</div></div>
  `;
}

export function wireActions(getColors, onReset) {
  document.getElementById('copyAllBtn').onclick = () => {
    const hexList = getColors().map(toHex).join(', ');
    copyText(hexList);
    showToast('All HEX codes copied!');
  };

  document.getElementById('copyCssBtn').onclick = () => {
    const vars = getColors()
      .map((c, i) => `  --color-${i + 1}: ${toHex(c)};`)
      .join('\n');
    copyText(`:root {\n${vars}\n}`);
    showToast('CSS variables copied!');
  };

  document.getElementById('downloadBtn').onclick = () => {
    const colors = getColors();
    const c = document.createElement('canvas');
    const cols = colors.length;
    const sw = 140;
    const sh = 100;

    c.width = sw * cols;
    c.height = sh + 40;

    const ctx = c.getContext('2d');
    ctx.fillStyle = '#13131a';
    ctx.fillRect(0, 0, c.width, c.height);

    colors.forEach(([r, g, b], i) => {
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(i * sw, 0, sw, sh);
      ctx.fillStyle = '#f0eff5';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(toHex([r, g, b]), i * sw + sw / 2, sh + 24);
    });

    const a = document.createElement('a');
    a.download = 'palette-snap.png';
    a.href = c.toDataURL();
    a.click();
    showToast('Palette downloaded!');
  };

  document.getElementById('resetBtn').onclick = onReset;
}
