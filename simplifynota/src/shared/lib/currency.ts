export const parseCurrencyBR = (value: string): number | null => {
    if (!value) return null;
    const normalized = value
        .replace(/[^\d,.-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  };
  
export const formatCurrencyBR = (value: string | number): string => {
    const num = typeof value === "number" ? value : parseCurrencyBR(value);
    if (num === null) return "";
    return num
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};  