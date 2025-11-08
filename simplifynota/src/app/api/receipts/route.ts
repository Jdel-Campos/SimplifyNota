import { NextResponse } from "next/server";
import { receiptSchema } from "@/entities/receipts/schema";
import { insertReceipt, listReceipts } from "@/infra/db/repositories/receipts.repository";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = receiptSchema.safeParse(body);
        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message ?? "Dados inválidos.";
            return NextResponse.json({ message: msg }, { status: 400 });
        }

        const result = await insertReceipt(parsed.data);
        return NextResponse.json({ message: "Recibo criado com sucesso!", data: result }, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar o recibo:", error);
        return NextResponse.json({ message: "Erro ao criar o recibo." }, { status: 500 });
    }
};

export async function GET() {
    try {
        const receipts = await listReceipts();
        return NextResponse.json({ receipts }, { status: 200 });
    } catch (error) {
        console.error("Erro ao buscar recibos:", error);
        return NextResponse.json({ message: "Erro ao buscar recibos." }, { status: 500 });
    }
};