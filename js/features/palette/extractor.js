export function extractColors(data, count) {
  const pixels = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;
    pixels.push([r, g, b]);
  }

  if (!pixels.length) {
    return [];
  }

  const sample = [];
  const step = Math.max(1, Math.floor(pixels.length / 800));
  for (let i = 0; i < pixels.length; i += step) {
    sample.push(pixels[i]);
  }

  const bucketSize = 32;
  const buckets = {};

  for (const [r, g, b] of sample) {
    const key = `${Math.floor(r / bucketSize)},${Math.floor(g / bucketSize)},${Math.floor(b / bucketSize)}`;
    if (!buckets[key]) buckets[key] = { sum: [0, 0, 0], count: 0 };
    buckets[key].sum[0] += r;
    buckets[key].sum[1] += g;
    buckets[key].sum[2] += b;
    buckets[key].count++;
  }

  const sorted = Object.values(buckets).sort((a, b) => b.count - a.count);

  const result = [];
  for (const bucket of sorted) {
    if (result.length >= count) break;

    const r = Math.round(bucket.sum[0] / bucket.count);
    const g = Math.round(bucket.sum[1] / bucket.count);
    const b = Math.round(bucket.sum[2] / bucket.count);

    let tooClose = false;
    for (const c of result) {
      const dist = Math.sqrt((r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2);
      if (dist < 55) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) result.push([r, g, b]);
  }

  let idx = 0;
  while (result.length < count && idx < sorted.length) {
    const bucket = sorted[idx++];
    const r = Math.round(bucket.sum[0] / bucket.count);
    const g = Math.round(bucket.sum[1] / bucket.count);
    const b = Math.round(bucket.sum[2] / bucket.count);
    if (!result.find((c) => c[0] === r && c[1] === g && c[2] === b)) {
      result.push([r, g, b]);
    }
  }

  return result.slice(0, count);
}

export function processImage(img, colorCount, canvasEl) {
  const ctx = canvasEl.getContext('2d');
  const size = 150;
  canvasEl.width = size;
  canvasEl.height = size;

  ctx.drawImage(img, 0, 0, size, size);

  let data;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch (error) {
    const err = new Error('Image is loaded but blocked by CORS for pixel access. Upload the image file directly.');
    err.cause = error;
    throw err;
  }

  const colors = extractColors(data, colorCount);
  const palette = getPaletteWithShare(data, colors);

  return {
    colors,
    palette,
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height
  };
}

function getPaletteWithShare(data, colors) {
  if (!colors.length) return [];

  const counts = new Array(colors.length).fill(0);
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue;

    total += 1;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let idx = 0; idx < colors.length; idx += 1) {
      const c = colors[idx];
      const dist = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;
      if (dist < bestDistance) {
        bestDistance = dist;
        bestIndex = idx;
      }
    }

    counts[bestIndex] += 1;
  }

  return colors.map((rgb, index) => ({
    rgb,
    share: total ? Math.round((counts[index] / total) * 100) : 0
  }));
}
