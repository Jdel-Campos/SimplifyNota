import jsPDF from "jspdf";
import { formatCurrencyBR } from "@/shared/lib/currency";
import type { Receipt } from "@/shared/types/receipt";
import {
  loadLetterheadA4DataURL,
  LETTERHEAD_PATH,
  SAFE_MM,
} from "@/shared/lib/letterhead";

export const generatePDF = async (data: Receipt) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  try {
    const base64 = await loadLetterheadA4DataURL(LETTERHEAD_PATH, "fill");
    doc.addImage(base64, "PNG", 0, 0, pageWidth, pageHeight);
  } catch {}

  const { top, right, bottom, left } = SAFE_MM;
  const lineHeight = 6;
  let y = top;
  const contentWidth = pageWidth - left - right;

  const add = (text: string, opts?: { bold?: boolean; center?: boolean }) => {
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, contentWidth);
    const x = opts?.center ? pageWidth / 2 : left;
    if (opts?.center) doc.text(lines, x, y, { align: "center" });
    else doc.text(lines, x, y);
    y += lines.length * lineHeight;
  };

  add("RECIBO DE PAGAMENTO", { bold: true, center: true });
  y += 2;

  const valor = formatCurrencyBR(data.value);
  const dataBR = new Date(data.eventDate).toLocaleDateString("pt-BR");
  add(`Refere-se ao pagamento a ${data.client} no valor de R$ ${valor} (${data.valueInWords}).`);
  add(`Foi realizado o trabalho de ${data.jobDescription}, referente ao evento ${data.eventName}, ocorrido no dia ${dataBR} no local ${data.eventLocation}, das ${data.startTime} às ${data.endTime}.`);
  add(`${data.city}, ${new Date().toLocaleDateString("pt-BR")}`);

  y = Math.max(y + 16, pageHeight - bottom - 22);
  const lineWidth = 80;
  const xStart = (pageWidth - lineWidth) / 2;
  doc.line(xStart, y, xStart + lineWidth, y);
  y += 6;
  doc.text("Assinatura", pageWidth / 2, y, { align: "center" });

  doc.save("recibo.pdf");
};
