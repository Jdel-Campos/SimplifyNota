// widgets/receipt-preview/receipt-preview.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useReceiptStore } from "@/shared/state/receipt-store";
import type { Receipt } from "@/shared/types/receipt";
import { loadLetterheadA4DataURL, LETTERHEAD_PATH } from "@/shared/lib/letterhead";
import { formatCurrencyBR } from "@/shared/lib/currency";
import { buildReceiptParagraphs } from "@/shared/lib/receipt-text";

export function ReceiptPreview() {
  const data: Receipt = useReceiptStore((s) => s.data);
  const [bg, setBg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadLetterheadA4DataURL(LETTERHEAD_PATH, "fill")
      .then((d) => alive && setBg(d))
      .catch(() => alive && setBg(null));
    return () => { alive = false; };
  }, []);

  const valorFmt = useMemo(() => (data.value ? formatCurrencyBR(data.value) : ""), [data.value]);
  const paragraphs = useMemo(
    () => buildReceiptParagraphs({ ...data, value: valorFmt || data.value }),
    [data, valorFmt]
  );

  return (
    <div className="a4 relative rounded-2xl overflow-hidden shadow bg-white">
      {/* timbrado */}
      <div
        className="a4-inner"
        style={{
          backgroundImage: bg ? `url(${bg})` : undefined,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top left",
          backgroundSize: "100% 100%",
        }}
      />

      {/* conteúdo */}
      <div
        className="a4-inner relative z-10"
        style={{
          paddingTop: "6%",
          paddingRight: "6%",
          paddingBottom: "11%",
          paddingLeft: "6%",
        }}
      >
        <div className="text-center">
          <h2 className="text-[18px] md:text-[16px] font-bold tracking-wide">RECIBO DE PAGAMENTO</h2>
        </div>

        <div className="mt-3 text-[14px] md:text-[13px] lg:text-[12px] leading-[1.65] text-gray-900 whitespace-pre-wrap">
          {paragraphs.map((t, i) => (
            <p key={i} className={i === 0 ? "font-semibold text-[13px] md:text-[12px] mb-2 text-center" : "mb-2"}>
              {t}
            </p>
          ))}
        </div>

        {/* Assinatura */}
        <div className="absolute left-0 right-0" style={{ bottom: "8%" }}>
          <div className="mx-auto w-[55%] border-t-2 border-gray-400" />
          <div className="mt-2 text-center text-[12px] md:text-[12px] text-gray-800">Assinatura</div>
        </div>
      </div>
    </div>
  );
}
