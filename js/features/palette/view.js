import { copyText, getContrastRatio, getLuminance, showToast, toHex } from '../../core/utils.js';

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

export function revealResults() {
  const section = document.getElementById('preview-section');
  const wrap = section.querySelector('.preview-wrap');

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (wrap) {
    wrap.classList.remove('result-flash');
    // Re-trigger animation for repeated extractions.
    void wrap.offsetWidth;
    wrap.classList.add('result-flash');
  }
}

export function renderPalette(palette) {
  const colors = palette.map((item) => item.rgb);

  const strip = document.getElementById('paletteStrip');
  strip.innerHTML = '';

  colors.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'palette-strip-color';
    div.style.background = `rgb(${c[0]},${c[1]},${c[2]})`;
    div.title = toHex(c);

    const hex = toHex(c);
    const copyStripColor = () => {
      copyText(toHex(c));
      showToast(`Copied ${toHex(c)}`);
    };

    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `Copy color ${hex}`);
    div.onclick = copyStripColor;
    div.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        copyStripColor();
      }
    };

    strip.appendChild(div);
  });

  const grid = document.getElementById('paletteGrid');
  grid.innerHTML = '';

  palette.forEach((item, i) => {
    const c = item.rgb;
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
        <div class="color-share">${item.share}% of image</div>
      </div>`;

    const copyCardColor = () => {
      copyText(hex);
      showToast(`Copied ${hex}!`);
    };

    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Copy ${hex} color values`);
    card.onclick = copyCardColor;
    card.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        copyCardColor();
      }
    };

    grid.appendChild(card);
  });

  document.getElementById('preview-section').style.display = 'block';
}

export function renderStats(colors) {
  if (!colors || !colors.length) {
    document.getElementById('statsRow').innerHTML = `
      <div class="stat"><div class="stat-label">COLORS</div><div class="stat-value">0</div></div>
      <div class="stat"><div class="stat-label">TONE</div><div class="stat-value">N/A</div></div>
      <div class="stat"><div class="stat-label">VARIETY</div><div class="stat-value">N/A</div></div>
      <div class="stat"><div class="stat-label">AVG BRIGHTNESS</div><div class="stat-value">0</div></div>
    `;
    return;
  }

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

function getContrastStatuses(ratio) {
  return {
    aaLarge: ratio >= 3,
    aaNormal: ratio >= 4.5,
    aaaLarge: ratio >= 4.5,
    aaaNormal: ratio >= 7
  };
}

export function renderAccessibilityAudit(colors) {
  const contrastGrid = document.getElementById('contrastGrid');
  const contrastSummary = document.getElementById('contrastSummary');
  contrastGrid.innerHTML = '';

  if (colors.length < 2) {
    contrastSummary.textContent = 'Need at least 2 colors to evaluate contrast pairs.';
    return;
  }

  const pairs = [];
  for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) {
      const first = colors[i];
      const second = colors[j];
      const ratio = getContrastRatio(first, second);
      pairs.push({
        first,
        second,
        ratio,
        statuses: getContrastStatuses(ratio)
      });
    }
  }

  pairs.sort((a, b) => b.ratio - a.ratio);

  const aaPasses = pairs.filter((pair) => pair.statuses.aaNormal).length;
  contrastSummary.textContent = `${aaPasses}/${pairs.length} pairs pass WCAG AA for normal text.`;

  pairs.forEach((pair) => {
    const firstHex = toHex(pair.first);
    const secondHex = toHex(pair.second);

    const card = document.createElement('article');
    card.className = 'contrast-card';
    card.innerHTML = `
      <div class="contrast-preview">
        <span style="background:${firstHex}"></span>
        <span style="background:${secondHex}"></span>
      </div>
      <div class="contrast-pair">${firstHex} vs ${secondHex}</div>
      <div class="contrast-ratio">${pair.ratio.toFixed(2)}:1</div>
      <div class="contrast-badges">
        <span class="contrast-badge ${pair.statuses.aaNormal ? 'pass' : 'fail'}">AA Text</span>
        <span class="contrast-badge ${pair.statuses.aaaNormal ? 'pass' : 'fail'}">AAA Text</span>
        <span class="contrast-badge ${pair.statuses.aaLarge ? 'pass' : 'fail'}">AA Large</span>
        <span class="contrast-badge ${pair.statuses.aaaLarge ? 'pass' : 'fail'}">AAA Large</span>
      </div>
    `;
    contrastGrid.appendChild(card);
  });
}
