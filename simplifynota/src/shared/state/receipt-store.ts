import { create } from "zustand";
import type { Receipt } from "@/shared/types/receipt";

export const initialReceipt: Receipt = {
  client: "", rawValue: "", value: "", valueInWords: "",
  jobDescription: "", eventName: "", eventDate: "",
  eventLocation: "", startTime: "", endTime: "", city: "",
};

type Store = {
  data: Receipt;
  setAll: (next: Receipt) => void;
  patch: (partial: Partial<Receipt>) => void;
  reset: () => void;
};

export const useReceiptStore = create<Store>((set) => ({
  data: initialReceipt,
  setAll: (next) => set({ data: next }),
  patch: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
  reset: () => set({ data: initialReceipt }),
}));