"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/shared/ui/button";
import { X } from "lucide-react";

// carrega o preview só quando abrir
const ReceiptPreview = dynamic(
  () => import("./receipt-preview").then((m) => ({ default: m.ReceiptPreview })),
  { ssr: false }
);

type Props = {
    label?: React.ReactNode;
    className?: string;
};

export function PreviewDialogTrigger({ label = "Ver preview", className }: Props) {
  const [open, setOpen] = useState(false);

  // trava scroll do body quando modal estiver aberto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <Button variant="outline" className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 top-6 md:top-10 mx-auto w-[98vw] md:w-[85vw] max-w-[1200px]">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Preview</h3>
                <button
                  aria-label="Fechar preview"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2 md:p-3">
                <ReceiptPreview />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
