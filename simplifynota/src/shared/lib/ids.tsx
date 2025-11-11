export const pad = (n: number, size = 5) => String(n).padStart(size, "0");

export const yyyy = (d = new Date()) => d.getFullYear();
export const yyyymmdd = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const shortRandom = (len = 4) => {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0].toString(36).slice(-len).toUpperCase();
  }
  return Math.random().toString(36).slice(-len).toUpperCase();
};

export const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);

export const formatReceiptNumber = (year: number, seq: number) =>
  `REC-${year}-${pad(seq, 5)}`;

export const generateLocalOS = (date = new Date()) =>
  `OS-${yyyymmdd(date)}-${shortRandom(4)}`;

export const generateInternalRef = (eventName?: string, date?: string) => {
  const base = eventName ? slugify(eventName) : "evento";
  const day = date ? yyyymmdd(new Date(date)) : yyyymmdd();
  return `${base}-${day}`;
};