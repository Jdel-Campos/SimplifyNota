// widgets/receipt-preview/receipt-preview.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useReceiptStore } from "@/shared/state/receipt-store";
import type { Receipt } from "@/shared/types/receipt";
import { loadLetterheadA4DataURL, LETTERHEAD_PATH } from "@/shared/lib/letterhead";
import { formatCurrencyBR, parseCurrencyBR } from "@/shared/lib/currency";

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

  const gross = useMemo(() => parseCurrencyBR(String(data.value)) ?? 0, [data.value]);
  const iss   = useMemo(() => data.enableTaxes ? (parseCurrencyBR(String(data.taxes?.iss ?? 0)) ?? 0) : 0, [data.enableTaxes, data.taxes?.iss]);
  const inss  = useMemo(() => data.enableTaxes ? (parseCurrencyBR(String(data.taxes?.inss ?? 0)) ?? 0) : 0, [data.enableTaxes, data.taxes?.inss]);
  const irrf  = useMemo(() => data.enableTaxes ? (parseCurrencyBR(String(data.taxes?.irrf ?? 0)) ?? 0) : 0, [data.enableTaxes, data.taxes?.irrf]);
  const other = useMemo(() => data.enableTaxes ? (parseCurrencyBR(String(data.taxes?.other ?? 0)) ?? 0) : 0, [data.enableTaxes, data.taxes?.other]);

  const totalRet = iss + inss + irrf + other;
  const net = Math.max(gross - totalRet, 0);

  const fmt = (n: number) => formatCurrencyBR(n);
  const fmtDate = (v?: string) => (v ? new Date(v).toLocaleDateString("pt-BR") : "____/____/____");
  const todayBR = useMemo(() => new Date().toLocaleDateString("pt-BR"), []);
  const payeeName = data.payeeName || data.client || "__________";

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

      {/* conteúdo (mantidos offsets) */}
      <div
        className="a4-inner relative z-10"
        style={{
          paddingTop: "20%",
          paddingRight: "6%",
          paddingBottom: "11%",
          paddingLeft: "6%",
        }}
      >
        {/* Título */}
        <div className="text-center">
          <h2 className="text-[18px] font-bold tracking-wide pb-3">RECIBO DE PAGAMENTO</h2>
        </div>

        {/* Cabeçalhos em caixas */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
          {/* Recebedor */}
          <div className="border border-gray-300 rounded-md p-2">
            <div className="grid grid-cols-5 gap-1">
              <span className="col-span-2 text-gray-600">Recebedor:</span>
              <span className="col-span-3 font-medium truncate">{payeeName}</span>

              <span className="col-span-2 text-gray-600">CPF/CNPJ:</span>
              <span className="col-span-3">{data.payeeCpfCnpj || "__________"}</span>

              <span className="col-span-2 text-gray-600">Endereço:</span>
              <span className="col-span-3 truncate">{data.payeeAddress || "__________"}</span>

              <span className="col-span-2 text-gray-600">Cidade/UF:</span>
              <span className="col-span-3">
                {(data.payeeCity || "__________")}{data.payeeState ? `/${data.payeeState}` : ""}
              </span>
            </div>
          </div>

          {/* Metadados / Pagamento */}
          <div className="border border-gray-300 rounded-md p-2">
            <div className="grid grid-cols-5 gap-1">
              <span className="col-span-2 text-gray-600">Nº Recibo:</span>
              <span className="col-span-3">{data.receiptNumber || "_____"}</span>

              <span className="col-span-2 text-gray-600">Emissão:</span>
              <span className="col-span-3">{fmtDate(data.issueDate ?? new Date().toISOString())}</span>

              <span className="col-span-2 text-gray-600">Forma pgto.:</span>
              <span className="col-span-3">{data.paymentMethod || "__________"}</span>

              <span className="col-span-2 text-gray-600">Data pgto.:</span>
              <span className="col-span-3">{data.paymentDate ? fmtDate(data.paymentDate) : "____/____/____"}</span>
            </div>
          </div>
        </div>

        {/* Evento */}
        <div className="mt-2 border border-gray-300 rounded-md p-2 text-[12px]">
          <div className="grid grid-cols-6 gap-1">
            <span className="text-gray-600 col-span-1">Evento:</span>
            <span className="col-span-5 font-medium truncate">{data.eventName || "__________"}</span>

            <span className="text-gray-600 col-span-1">Data:</span>
            <span className="col-span-2">{fmtDate(data.eventDate)}</span>

            <span className="text-gray-600 col-span-1">Horário:</span>
            <span className="col-span-2">{(data.startTime || "__:__") + " às " + (data.endTime || "__:__")}</span>

            <span className="text-gray-600 col-span-1">Local:</span>
            <span className="col-span-5 truncate">{data.eventLocation || "__________"}</span>

            <span className="text-gray-600 col-span-1">Cidade:</span>
            <span className="col-span-2">{data.city || "__________"}</span>
          </div>
        </div>

        {/* Tabela (1 item) */}
        <div className="mt-2 border border-gray-300 rounded-md overflow-hidden">
          <div className="grid grid-cols-12 text-[11.5px] font-semibold bg-gray-100 border-b border-gray-300">
            <div className="col-span-7 px-2 py-1.5">Descrição</div>
            <div className="col-span-2 px-2 py-1.5 text-right">Qtd</div>
            <div className="col-span-1 px-2 py-1.5 text-right">Un.</div>
            <div className="col-span-2 px-2 py-1.5 text-right">Total</div>
          </div>

          <div className="grid grid-cols-12 text-[11.5px]">
            <div className="col-span-7 px-2 py-2 border-b border-gray-200">
              {data.jobDescription || "__________"}
            </div>
            <div className="col-span-2 px-2 py-2 border-b border-gray-200 text-right">1</div>
            <div className="col-span-1 px-2 py-2 border-b border-gray-200 text-right">{fmt(gross)}</div>
            <div className="col-span-2 px-2 py-2 border-b border-gray-200 text-right">{fmt(gross)}</div>
          </div>

          {/* Resumo/Referências */}
          <div className="grid grid-cols-12 text-[11.5px]">
            <div className="col-span-8 px-2 py-2 border-t border-gray-300">
              <div className="text-[11px] space-y-1">
                {data.purchaseOrder && <div>PO/OS: <span className="font-medium">{data.purchaseOrder}</span></div>}
                {data.costCenter &&   <div>Centro de Custo: <span className="font-medium">{data.costCenter}</span></div>}
                {data.internalRef &&  <div>Ref. Interna: <span className="font-medium">{data.internalRef}</span></div>}
              </div>
            </div>

            <div className="col-span-4 border-t border-gray-300">
              <div className="grid grid-cols-2 text-[11.5px]">
                <div className="px-2 py-1.5">Valor bruto</div>
                <div className="px-2 py-1.5 text-right font-medium">{fmt(gross)}</div>

                {data.enableTaxes ? (
                  <>
                    {iss > 0   && (<><div className="px-2 py-1.5">(-) ISS</div>   <div className="px-2 py-1.5 text-right">-{fmt(iss)}</div></>)}
                    {inss > 0  && (<><div className="px-2 py-1.5">(-) INSS</div>  <div className="px-2 py-1.5 text-right">-{fmt(inss)}</div></>)}
                    {irrf > 0  && (<><div className="px-2 py-1.5">(-) IRRF</div>  <div className="px-2 py-1.5 text-right">-{fmt(irrf)}</div></>)}
                    {other > 0 && (<><div className="px-2 py-1.5">(-) Outras</div><div className="px-2 py-1.5 text-right">-{fmt(other)}</div></>)}
                    <div className="px-2 py-1.5 font-semibold border-t border-gray-200">Valor líquido</div>
                    <div className="px-2 py-1.5 text-right font-semibold border-t border-gray-200">{fmt(net)}</div>
                  </>
                ) : (
                  <>
                    <div className="px-2 py-1.5 font-semibold border-t border-gray-200">Valor líquido</div>
                    <div className="px-2 py-1.5 text-right font-semibold border-t border-gray-200">{fmt(gross)}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé (cidade/data) + Assinatura */}
        <div className="pt-3 flex flex-col items-center">
          {/* Assinatura — LINHA MAIOR */}
          <div className="mt-20">

            <hr className="my-2 border-gray-400 w-[350px]" />
            <div className="mt-2 text-center text-[12px] md:text-[12px] text-gray-800">Assinatura</div>
          </div>

          <div className="mt-4 justify-center text-[12px]">
            <div className="mb-2">{(data.city || "") + ", " + todayBR}</div>
          </div>

          {(data.showNFNote ?? true) && (
            <div className="absolute left-0 right-0" style={{ bottom: "12%" }}>
              <div className="mx-auto w-[88%] text-[10px] text-gray-700 border border-gray-300 rounded-md p-3">
                <span className="font-bold text-[11px]">Observação:</span> este recibo reconhece o pagamento/recebimento. Quando exigida por lei,
                a emissão de Nota Fiscal permanece obrigatória.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
