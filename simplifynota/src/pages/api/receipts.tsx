import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/utils/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);

      const {
        client: clientName,
        rawValue,
        value,
        valueInWords,
        jobDescription,
        eventName,
        eventDate,
        eventLocation,
        startTime,
        endTime,
        city,
      } = req.body;

      if (!clientName || !value || !jobDescription || !eventName || !eventDate || !eventLocation || !startTime || !endTime || !city) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
      }

      const result = await db.collection("receipts").insertOne({
        client: clientName,
        rawValue,
        value,
        valueInWords,
        jobDescription,
        eventName,
        eventDate,
        eventLocation,
        startTime,
        endTime,
        city,
        createdAt: new Date(),
      });

      return res.status(201).json({ message: "Recibo criado com sucesso!", data: result });
    } catch (error) {
      console.error("Erro ao criar o recibo:", error);
      return res.status(500).json({ message: "Erro ao criar o recibo." });
    }
  } else if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);

      const receipts = await db.collection("receipts").find({}).toArray();

      return res.status(200).json({ receipts });
    } catch (error) {
      console.error("Erro ao buscar recibos:", error);
      return res.status(500).json({ message: "Erro ao buscar recibos." });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }
}
