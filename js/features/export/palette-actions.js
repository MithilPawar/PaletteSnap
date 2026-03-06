import { copyText, showToast, toHex } from '../../core/utils.js';

export function wirePaletteActions(getColors, onReset) {
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
