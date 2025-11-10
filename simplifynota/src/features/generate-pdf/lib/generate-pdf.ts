import jsPDF from "jspdf";
import type { Receipt } from "@/shared/types/receipt";
import { loadLetterheadA4DataURL, LETTERHEAD_PATH } from "@/shared/lib/letterhead";
import { parseCurrencyBR, formatCurrencyBR } from "@/shared/lib/currency";

export const generatePDF = async (d: Receipt) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 210mm
  const H = doc.internal.pageSize.getHeight();  // 297mm

  // Timbrado (preenche 100%)
  try {
    const base64 = await loadLetterheadA4DataURL(LETTERHEAD_PATH, "fill");
    doc.addImage(base64, "PNG", 0, 0, W, H);
  } catch {}

  // === Offsets iguais ao preview ===
  const PAD_TOP    = H * 0.20; // 20%
  const PAD_RIGHT  = W * 0.06; // 6%
  const PAD_BOTTOM = H * 0.11; // 11%
  const PAD_LEFT   = W * 0.06; // 6%

  // Content box
  let y = PAD_TOP;
  const X  = PAD_LEFT;
  const CW = W - PAD_LEFT - PAD_RIGHT;
  const pad = 3;

  // Helpers
  const bold = (size: number) => { doc.setFont("helvetica", "bold"); doc.setFontSize(size); };
  const norm = (size: number) => { doc.setFont("helvetica", "normal"); doc.setFontSize(size); };
  const box  = (x: number, y0: number, w: number, h: number) => doc.rect(x, y0, w, h);
  const rbox = (x: number, y0: number, w: number, h: number, r = 2) => {
    const anyDoc: any = doc;
    if (anyDoc.roundedRect) anyDoc.roundedRect(x, y0, w, h, r, r);
    else box(x, y0, w, h);
  };
  const label = (txt: string, x: number, yy: number) => { norm(9.5); doc.text(txt, x, yy); };
  const value = (
    txt: string, x: number, yy: number,
    align: "left" | "right" = "left", isBold = false, size = 10
  ) => { (isBold ? bold(size) : norm(size)); doc.text(txt, x, yy, { align }); };

  // Números
  const gross = parseCurrencyBR(String(d.value)) ?? 0;
  const iss   = d.enableTaxes ? (parseCurrencyBR(String(d.taxes?.iss ?? 0)) ?? 0) : 0;
  const inss  = d.enableTaxes ? (parseCurrencyBR(String(d.taxes?.inss ?? 0)) ?? 0) : 0;
  const irrf  = d.enableTaxes ? (parseCurrencyBR(String(d.taxes?.irrf ?? 0)) ?? 0) : 0;
  const other = d.enableTaxes ? (parseCurrencyBR(String(d.taxes?.other ?? 0)) ?? 0) : 0;
  const net   = Math.max(gross - (iss + inss + irrf + other), 0);

  const fmt = (n: number) => formatCurrencyBR(n);
  const fmtDate = (v?: string) => (v ? new Date(v).toLocaleDateString("pt-BR") : "____/____/____");
  const todayBR = new Date().toLocaleDateString("pt-BR");

  // === Título ===
  bold(13);
  doc.text("RECIBO DE PAGAMENTO", X + CW / 2, y, { align: "center" });
  y += 6;

  // === Cabeçalhos (2 colunas) ===
  const colW = (CW - pad) / 2;
  const headH = 30;

  // Recebedor
  box(X, y, colW, headH);
  label("Recebedor:", X + pad, y + 6);
  value(d.payeeName || d.client || "__________", X + 28, y + 6, "left", true);

  label("CPF/CNPJ:", X + pad, y + 12);
  value(d.payeeCpfCnpj || "__________", X + 28, y + 12);

  label("Endereço:", X + pad, y + 18);
  value(d.payeeAddress || "__________", X + 28, y + 18);

  label("Cidade/UF:", X + pad, y + 24);
  value(`${d.payeeCity || "__________"}${d.payeeState ? "/" + d.payeeState : ""}`, X + 28, y + 24);

  // Meta / Pagamento
  box(X + colW + pad, y, colW, headH);
  label("Nº Recibo:", X + colW + pad + pad, y + 6);
  value(d.receiptNumber || "_____", X + colW + colW + pad - 2, y + 6, "right", true);

  label("Emissão:", X + colW + pad + pad, y + 12);
  value(fmtDate(d.issueDate ?? new Date().toISOString()), X + colW + colW + pad - 2, y + 12, "right");

  label("Forma pgto.:", X + colW + pad + pad, y + 18);
  value(d.paymentMethod || "__________", X + colW + colW + pad - 2, y + 18, "right");

  label("Data pgto.:", X + colW + pad + pad, y + 24);
  value(d.paymentDate ? fmtDate(d.paymentDate) : "____/____/____", X + colW + colW + pad - 2, y + 24, "right");

  y += headH + 4;

  // === Evento (full width) ===
  const evH = 24;
  box(X, y, CW, evH);
  label("Evento:", X + pad, y + 6);
  value(d.eventName || "__________", X + 28, y + 6, "left", true);

  label("Data:", X + pad, y + 12);
  value(fmtDate(d.eventDate), X + 28, y + 12);

  label("Horário:", X + 70, y + 12);
  value(`${d.startTime || "__:__"} às ${d.endTime || "__:__"}`, X + 94, y + 12);

  label("Local:", X + pad, y + 18);
  value(d.eventLocation || "__________", X + 28, y + 18);

  label("Cidade:", X + 130, y + 18);
  value(d.city || "__________", X + 150, y + 18);

  y += evH + 4;

  // === Tabela (1 linha) ===
  const th = 8;
  const rowH = 10;
  const cDesc = CW * 0.58;
  const cQtd  = CW * 0.12;
  const cUn   = CW * 0.10;
  const cTot  = CW * 0.20;

  // header
  box(X, y, CW, th);
  bold(9.5);
  doc.text("Descrição", X + 2, y + 5.5);
  doc.text("Qtd",      X + cDesc + 2,            y + 5.5);
  doc.text("Un.",      X + cDesc + cQtd + 2,     y + 5.5);
  doc.text("Total",    X + cDesc + cQtd + cUn + 2, y + 5.5);

  // linhas verticais
  doc.line(X + cDesc,                y, X + cDesc,                y + th + rowH);
  doc.line(X + cDesc + cQtd,         y, X + cDesc + cQtd,         y + th + rowH);
  doc.line(X + cDesc + cQtd + cUn,   y, X + cDesc + cQtd + cUn,   y + th + rowH);

  // row
  box(X, y + th, CW, rowH);
  norm(10);
  doc.text(d.jobDescription || "__________", X + 2, y + th + 6);
  doc.text("1",                          X + cDesc + cQtd - 4,         y + th + 6, { align: "right" });
  doc.text(fmt(gross),                   X + cDesc + cQtd + cUn - 4,   y + th + 6, { align: "right" });
  doc.text(fmt(gross),                   X + CW - 4,                   y + th + 6, { align: "right" });

  // === Resumo/Referências ===
  y += th + rowH + 4;
  const sumW  = CW * 0.42;
  const leftW = CW - sumW - 4;

  // Referências (esquerda)
  box(X, y, leftW, 18);
  norm(9.5);
  let yy = y + 6;
  if (d.purchaseOrder) { doc.text(`PO/OS: ${d.purchaseOrder}`, X + 2, yy); yy += 5; }
  if (d.costCenter)   { doc.text(`Centro de Custo: ${d.costCenter}`, X + 2, yy); yy += 5; }
  if (d.internalRef)  { doc.text(`Ref. Interna: ${d.internalRef}`, X + 2, yy); }

  // Totais (direita)
  box(X + leftW + 4, y, sumW, 18);
  norm(9.5); doc.text("Valor bruto", X + leftW + 6, y + 6);
  doc.text(fmt(gross), X + leftW + sumW - 4, y + 6, { align: "right" });

  let yLine = y + 10;
  if (d.enableTaxes) {
    const lines: Array<[string, number]> = [];
    if (iss   > 0) lines.push(["(-) ISS",   iss]);
    if (inss  > 0) lines.push(["(-) INSS",  inss]);
    if (irrf  > 0) lines.push(["(-) IRRF",  irrf]);
    if (other > 0) lines.push(["(-) Outras", other]);
    for (const [t, v] of lines) {
      doc.text(t, X + leftW + 6, yLine);
      doc.text(`-${fmt(v)}`, X + leftW + sumW - 4, yLine, { align: "right" });
      yLine += 4.5;
    }
  }
  bold(9.5);
  doc.text("Valor líquido", X + leftW + 6, y + 16);
  doc.text(fmt(d.enableTaxes ? net : gross), X + leftW + sumW - 4, y + 16, { align: "right" });

  // === Rodapé ===
  // Cidade/Data (mesma região do preview)
  norm(9.5);
  const yCity = Math.max(y + 24, H - PAD_BOTTOM - 28);
  doc.text(`${d.city || "__________"}, ${todayBR}`, X, yCity);

  // Assinatura centralizada
  const sigY  = H - PAD_BOTTOM - 16;      // altura final
  const sigW  = CW * 0.44;                // ~350px proporcional
  const sigXs = X + (CW - sigW) / 2;
  doc.line(sigXs, sigY, sigXs + sigW, sigY);
  norm(9.5); doc.text("Assinatura", X + CW / 2, sigY + 6, { align: "center" });

  // === Observação ancorada como no preview ===
  if (d.showNFNote ?? true) {
    const obsText = "Este recibo reconhece o pagamento/recebimento. Quando exigida por lei, a emissão de Nota Fiscal permanece obrigatória.";
    const obsW = CW * 0.88;
    const obsX = X + (CW - obsW) / 2;
    const obsBottomOffset = H * 0.12; // 12% do bottom, igual ao preview
    const lines = doc.splitTextToSize(obsText, obsW - pad * 2);
    const lineH = 4.2;
    const obsH = lines.length * lineH + pad * 2;

    const obsY = H - obsBottomOffset - obsH;
    rbox(obsX, obsY, obsW, obsH, 2);
    bold(10);
    doc.text("Observação:", obsX + pad, obsY + pad + 3.6);
    norm(9.5);
    // reposiciona texto após o título
    const textY = obsY + pad + 3.6 + 4.2;
    doc.text(lines, obsX + pad, textY);
  }

  doc.save("recibo.pdf");
};
