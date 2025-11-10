// shared/lib/receipt-text.ts
import { formatCurrencyBR, parseCurrencyBR } from "@/shared/lib/currency";
import type { Receipt } from "@/shared/types/receipt";

const p = (v?: string, filler = "__________") =>
  (typeof v === "string" && v.trim().length > 0) ? v.trim() : filler;

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString("pt-BR") : "____/____/____";

const futureByDate = (eventDate?: string) => {
  if (!eventDate) return false;
  const ev = new Date(eventDate + "T00:00:00").getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return ev > today; // igual a hoje => passado
};

export function buildReceiptParagraphs(d: Receipt): string[] {
  const grossNum = parseCurrencyBR(String(d.value)) ?? 0;
  const grossFmt = formatCurrencyBR(grossNum);
  const inWords = d.valueInWords ? d.valueInWords : "";

  const applyTaxes = !!d.enableTaxes;

  const toNum = (v?: number | string) =>
    v == null ? 0 : (typeof v === "number" ? v : (parseCurrencyBR(String(v)) ?? 0));

  const iss   = applyTaxes ? toNum(d.taxes?.iss)   : 0;
  const inss  = applyTaxes ? toNum(d.taxes?.inss)  : 0;
  const irrf  = applyTaxes ? toNum(d.taxes?.irrf)  : 0;
  const other = applyTaxes ? toNum(d.taxes?.other) : 0;

  const totalRet = iss + inss + irrf + other;
  const net = Math.max(grossNum - totalRet, 0);

  const isFuture = futureByDate(d.eventDate);
  const dataBR = fmtDate(d.eventDate);

  const payee  = p(d.payeeName ?? d.client);
  const payeeDoc = p(d.payeeCpfCnpj);
  const payer  = p(d.payerName ?? "Empresa pagadora");
  const payerDoc = p(d.payerCnpj);

  const header = `RECIBO DE PAGAMENTO Nº ${p(d.receiptNumber, "_____")} – Emitido em ${fmtDate(d.issueDate ?? new Date().toISOString())}`;

  const partes1 = `Recebedor: ${payee} (CPF/CNPJ ${payeeDoc})${d.payeeAddress ? ` – Endereço: ${d.payeeAddress}` : ""}${d.payeeCity ? ` – ${d.payeeCity}${d.payeeState ? `/${d.payeeState}` : ""}` : ""}.`;
  const partes2 = `Pagador: ${payer} (CNPJ ${payerDoc})${d.payerAddress ? ` – Endereço: ${d.payerAddress}` : ""}${d.payerCity ? ` – ${d.payerCity}${d.payerState ? `/${d.payerState}` : ""}` : ""}.`;

  const declaracao = `Declaramos, para os devidos fins, que ${payee} recebeu de ${payer} a quantia de R$ ${grossFmt}${inWords ? ` (${inWords})` : ""}.`;

  const corpo = isFuture
    ? `Referente ao(s) serviço(s) de ${p(d.jobDescription)} no âmbito do evento ${p(d.eventName)}, que ocorrerá no dia ${dataBR} no local ${p(d.eventLocation)}, das ${p(d.startTime, "__:__")} às ${p(d.endTime, "__:__")}.`
    : `Referente ao(s) serviço(s) de ${p(d.jobDescription)} no âmbito do evento ${p(d.eventName)}, realizado no dia ${dataBR} no local ${p(d.eventLocation)}, das ${p(d.startTime, "__:__")} às ${p(d.endTime, "__:__")}.`;

  const pagamento = `Forma de pagamento: ${p(d.paymentMethod, "__________")}${d.paymentDate ? ` – Data do pagamento: ${fmtDate(d.paymentDate)}` : ""}.`;

  const refs: string[] = [];
  if (d.purchaseOrder) refs.push(`PO/OS: ${d.purchaseOrder}`);
  if (d.costCenter)   refs.push(`Centro de Custo: ${d.costCenter}`);
  if (d.internalRef)  refs.push(`Ref. Interna: ${d.internalRef}`);
  const referencias = refs.length ? refs.join(" – ") + "." : "";

  const reten = applyTaxes && totalRet > 0
    ? `O valor bruto de R$ ${formatCurrencyBR(grossNum)} sofreu retenções de ${
        iss ? `ISS R$ ${formatCurrencyBR(iss)}` : ""
      }${iss && (inss || irrf || other) ? ", " : ""}${
        inss ? `INSS R$ ${formatCurrencyBR(inss)}` : ""
      }${(iss || inss) && (irrf || other) ? ", " : ""}${
        irrf ? `IRRF R$ ${formatCurrencyBR(irrf)}` : ""
      }${(iss || inss || irrf) && other ? ", " : ""}${
        other ? `Outras R$ ${formatCurrencyBR(other)}` : ""
      }, totalizando R$ ${formatCurrencyBR(totalRet)}. Valor líquido recebido: R$ ${formatCurrencyBR(net)}.`
    : "";

  const cidadeData = `${p(d.city)}, ${fmtDate(new Date().toISOString())}`;

  const notaFiscalObs = (d.showNFNote ?? true)
    ? "Observação: este recibo reconhece o pagamento/recebimento. Quando exigida por lei, a emissão de Nota Fiscal permanece obrigatória."
    : "";

  return [header, partes1, partes2, declaracao, corpo, pagamento, referencias, reten, cidadeData, notaFiscalObs]
    .filter(Boolean);
}
