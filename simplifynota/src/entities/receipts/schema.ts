import { z } from "zod";

export const receiptSchema = z.object({
    client: z.string().trim().min(1, "Nome do recebedor é obrigatório"),
    rawValue: z.string().trim().min(1, "Valor é obrigatório"),
    value: z.string().trim().min(1, "Valor formatado é obrigatório"),
    valueInWords: z.string().trim().min(1, "Valor por extenso é obrigatório"),
    jobDescription: z.string().trim().min(1, "Descrição do trabalho é obrigatória"),
    eventName: z.string().trim().min(1, "Nome do evento é obrigatório"),
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
    eventLocation: z.string().trim().min(1, "Local do evento é obrigatório"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inicial inválido"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário final inválido"),
    city: z.string().trim().min(1, "Cidade é obrigatória"),
});

export type ReceiptInput = z.infer<typeof receiptSchema>;