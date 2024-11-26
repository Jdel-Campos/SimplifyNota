import jsPDF from "jspdf";

export const generatePDF = async (data: {
  description: string;
  date: string;
  client: string;
  value: string;
  valueInWords: string;
  signature: string;
}) => {
  const doc = new jsPDF();

  // Caminho para a imagem do papel timbrado
  const img = "/public/papel-timbrado.jpg"; // Certifique-se de salvar a imagem aqui
  const imgWidth = 210; // Largura do A4 em mm
  const imgHeight = 297; // Altura do A4 em mm

  try {
    // Carregar a imagem como base64
    const response = await fetch(img);
    const blob = await response.blob();
    const reader = new FileReader();

    reader.onload = function () {
      const base64 = reader.result as string;

      // Adicionar o papel timbrado como fundo
      doc.addImage(base64, "JPEG", 0, 0, imgWidth, imgHeight);

      // Conteúdo do recibo
      doc.setFontSize(16);
      doc.text("RECIBO DE PAGAMENTO", 20, 50);

      doc.setFontSize(12);
      doc.text(`REFERE-SE AO PAGAMENTO A ${data.client.toUpperCase()} NO VALOR DE R$ ${data.value}`, 20, 70);
      doc.text(`(${data.valueInWords.toUpperCase()}).`, 20, 80);
      doc.text(`${data.description.toUpperCase()}.`, 20, 90);
      doc.text(`QUE OCORREU DIA ${new Date(data.date).toLocaleDateString("pt-BR")}.`, 20, 100);

      const currentDate = new Date().toLocaleDateString("pt-BR");
      doc.text(`BARBACENA, ${currentDate}`, 20, 120);

      // Linha de assinatura
      doc.line(20, 150, 120, 150);
      doc.text("ASSINATURA", 20, 160);

      // Salvar o PDF
      doc.save("recibo.pdf");
    };

    reader.readAsDataURL(blob);
  } catch (error) {
    console.error("Erro ao carregar a imagem:", error);
    alert("Erro ao gerar o PDF.");
  }
};