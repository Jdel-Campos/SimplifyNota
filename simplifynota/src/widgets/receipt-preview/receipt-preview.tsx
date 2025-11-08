"use client";

import { useEffect, useMemo, useState } from "react";
import { useReceiptStore } from "@/shared/state/receipt-store";
import type { Receipt } from "@/shared/types/receipt";
import { formatCurrencyBR } from "@/shared/lib/currency";
import { loadLetterheadA4DataURL } from "@/shared/lib/letterhead";
import { LETTERHEAD_PATH, SAFE_PX } from "@/shared/lib/letterhead";

export function ReceiptPreview() {
  const data: Receipt = useReceiptStore((s) => s.data);
  const [bg, setBg] = useState<string | null>(null);

  // normaliza o timbrado 1x (dataURL A4)
  useEffect(() => {
    let alive = true;
    loadLetterheadA4DataURL(LETTERHEAD_PATH, "fill")
      .then((d) => alive && setBg(d))
      .catch(() => alive && setBg(null));
    return () => { alive = false; };
  }, []);

  const valorFmt = useMemo(() => (data.value ? formatCurrencyBR(data.value) : ""), [data.value]);
  const dataBR = useMemo(
    () => (data.eventDate ? new Date(data.eventDate).toLocaleDateString("pt-BR") : ""),
    [data.eventDate]
  );

  return (
    <div className="a4 relative rounded-2xl overflow-hidden shadow bg-white">
      {/* timbrado como background da própria página (fica ATRÁS) */}
      <div
        className="a4-inner"
        style={{
          backgroundImage: bg ? `url(${bg})` : undefined,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top left",
          backgroundSize: "100% 100%",
        }}
      />

      {/* conteúdo acima do fundo */}
      <div
        className="a4-inner relative z-10"
        style={{
          top: SAFE_PX.top,
          left: SAFE_PX.left,
          right: SAFE_PX.right,
          bottom: SAFE_PX.bottom,
          position: "absolute",
        }}
      >
        <div className="text-center">
          <h2 className="text-[16px] font-bold tracking-wide">RECIBO DE PAGAMENTO</h2>
        </div>

        <div className="mt-3 text-[12px] leading-relaxed text-gray-900 whitespace-pre-wrap">
          <p className="mb-2">
            {`Refere-se ao pagamento a ${data.client || "__________"} no valor de R$ ${valorFmt || "_____"}${
              data.valueInWords ? ` (${data.valueInWords})` : ""
            }.`}
          </p>
          <p className="mb-2">
            {`Foi realizado o trabalho de ${data.jobDescription || "__________"}, referente ao evento ${
              data.eventName || "__________"
            }, ocorrido no dia ${dataBR || "____/____/____"} no local ${
              data.eventLocation || "__________"
            }, das ${data.startTime || "__:__"} às ${data.endTime || "__:__"}.`}
          </p>
          <p>{`${data.city || "__________"}, ${new Date().toLocaleDateString("pt-BR")}`}</p>
        </div>

        <div className="absolute left-0 right-0" style={{ bottom: "8%" }}>
          <div className="mx-auto w-[55%] border-t border-gray-700" />
          <div className="mt-2 text-center text-[12px] text-gray-800">Assinatura</div>
        </div>
      </div>
    </div>
  );
}
