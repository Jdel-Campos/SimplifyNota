import jsPDF from "jspdf";

export const generatePDF = async (data: {
  client: string;
  value: string;
  valueInWords: string;
  jobDescription: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  startTime: string;
  endTime: string;
  city: string;
}) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth(); 
  const marginLeft = 20;
  const marginRight = 190; 
  const lineHeight = 10;

  const headerHeight = 40; 
  let currentHeight = headerHeight + 10; 

  const img = "/letterhead-viva-events.jpg"; 
  const imgWidth = 210; 
  const imgHeight = 297; 

  const addText = (text: string) => {
    const lines = doc.splitTextToSize(text, pageWidth - marginLeft * 2);
    doc.text(lines, marginLeft, currentHeight);
    currentHeight += lines.length * lineHeight;
  };

  try {
    const response = await fetch(img);
    const blob = await response.blob();
    const reader = new FileReader();

    reader.onload = function () {
      const base64 = reader.result as string;

      doc.addImage(base64, "JPEG", 0, 0, imgWidth, imgHeight);

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("RECIBO DE PAGAMENTO", pageWidth / 2, currentHeight, {
        align: "center",
      });
      currentHeight += lineHeight + 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      addText(
        `Refere-se ao pagamento a ${data.client} no valor de R$ ${data.value} (${data.valueInWords}).`
      );
      addText(
        `Foi realizado o trabalho de ${data.jobDescription}, referente ao evento ${data.eventName}, ocorrido no dia ${new Date(
          data.eventDate
        ).toLocaleDateString("pt-BR")} no local ${data.eventLocation}, das ${
          data.startTime
        } às ${data.endTime}.`
      );

      const currentDate = new Date().toLocaleDateString("pt-BR");
      addText(`${data.city}, ${currentDate}`);

      currentHeight += 40; 
      const signatureLineWidth = 80;
      const signatureLineStart = (pageWidth - signatureLineWidth) / 2;
      doc.line(signatureLineStart, currentHeight, signatureLineStart + signatureLineWidth, currentHeight);
      currentHeight += 10;

      doc.text("Assinatura", pageWidth / 2, currentHeight, { align: "center" });

      doc.save("recibo.pdf");
    };

    reader.readAsDataURL(blob);
  } catch (error) {
    console.error("Erro ao carregar a imagem:", error);
    alert("Erro ao gerar o PDF.");
  }
};