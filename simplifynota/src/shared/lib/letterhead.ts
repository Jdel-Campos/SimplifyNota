const A4 = { w: 1240, h: 1754 };

export type FitMode = "fill" | "contain" | "cover";

export async function loadLetterheadA4DataURL(
  src: string,
  fit: FitMode = "fill"
): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = A4.w;
  canvas.height = A4.h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, A4.w, A4.h);

  const { dx, dy, dw, dh } = computeFit(img.naturalWidth, img.naturalHeight, A4.w, A4.h, fit);
  ctx.drawImage(img, dx, dy, dw, dh);

  return canvas.toDataURL("image/png", 0.92);
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
    (img as any).decoding = "async";
    (img as any).fetchPriority = "low";
    img.crossOrigin = "anonymous";
  });
};

function computeFit(sw: number, sh: number, dw: number, dh: number, mode: FitMode) {
  const sr = sw / sh;
  const dr = dw / dh;

  if (mode === "fill") {
    return { dx: 0, dy: 0, dw, dh };
  }

  if (mode === "contain") {
    const scale = Math.min(dw / sw, dh / sh);
    const w = sw * scale;
    const h = sh * scale;
    return { dx: (dw - w) / 2, dy: (dh - h) / 2, dw: w, dh: h };
  }

  const scale = Math.max(dw / sw, dh / sh);
  const w = sw * scale;
  const h = sh * scale;
  return { dx: (dw - w) / 2, dy: (dh - h) / 2, dw: w, dh: h };
};

export const LETTERHEAD_PATH = "/letterheads/viva-a4.jpg";

export const A4_CANVAS = { w: 1240, h: 1754 };

export const PX_PER_MM_X = A4_CANVAS.w / 210;
export const PX_PER_MM_Y = A4_CANVAS.h / 297;

export const SAFE_MM = { top: 66, right: 18, bottom: 36, left: 18 };

export const SAFE_PX = {
  top: Math.round(SAFE_MM.top * PX_PER_MM_Y),
  right: Math.round(SAFE_MM.right * PX_PER_MM_X),
  bottom: Math.round(SAFE_MM.bottom * PX_PER_MM_Y),
  left: Math.round(SAFE_MM.left * PX_PER_MM_X),
};