import { slugify } from "@/shared/lib/ids";

const yyyymm = (d = new Date()) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;

export const generateCostCenterLocal = (eventName?: string, eventDate?: string) => {
  const prefix = eventName
    ? slugify(eventName).split("-")[0].toUpperCase().slice(0, 6)
    : "CC";
  const d = eventDate ? new Date(eventDate + "T00:00:00") : new Date();
  return `CC-${prefix}-${yyyymm(d)}`;
};

export const resolveCostCenter = async (eventName?: string, eventDate?: string) => {
  try {
    const url = `/api/cost-center/resolve?eventName=${encodeURIComponent(eventName || "")}&eventDate=${encodeURIComponent(eventDate || "")}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("no-rule");
    const data = await res.json();
    return (data?.costCenter as string) || generateCostCenterLocal(eventName, eventDate);
  } catch {
    return generateCostCenterLocal(eventName, eventDate);
  };
};