import { copyText, showToast, toHex } from '../../core/utils.js';

export function wirePaletteActions(getColors, onReset) {
  const actionIds = ['copyAllBtn', 'copyCssBtn', 'downloadBtn'];

  function setActionsEnabled(enabled) {
    actionIds.forEach((id) => {
      const button = document.getElementById(id);
      button.disabled = !enabled;
      button.setAttribute('aria-disabled', String(!enabled));
    });
  }

  document.getElementById('copyAllBtn').onclick = () => {
    const colors = getColors();
    if (!colors.length) return;
    const hexList = colors.map(toHex).join(', ');
    copyText(hexList);
    showToast('All HEX codes copied!');
  };

  document.getElementById('copyCssBtn').onclick = () => {
    const colors = getColors();
    if (!colors.length) return;
    const vars = colors
      .map((c, i) => `  --color-${i + 1}: ${toHex(c)};`)
      .join('\n');
    copyText(`:root {\n${vars}\n}`);
    showToast('CSS variables copied!');
  };

  document.getElementById('downloadBtn').onclick = () => {
    const colors = getColors();
    if (!colors.length) return;
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

  setActionsEnabled(false);
  return { setActionsEnabled };
}
