import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/utils/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);

      const { description, date, client: clientName, value, valueInWords, signature } = req.body;

      if (!description || !date || !clientName || !value || !signature) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
      }

      const result = await db.collection("receipts").insertOne({
        description,
        date,
        clientName,
        value,
        valueInWords,
        signature,
        createdAt: new Date(),
      });

      return res.status(201).json({ message: "Nota salva com sucesso!", data: result });
    } catch (error) {
      console.error("Erro na API receipts:", error);
      return res.status(500).json({ message: "Erro ao salvar a nota no banco de dados." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }
}
