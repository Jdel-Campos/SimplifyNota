"use client";

import { ReceiptForm } from "@/features/create-receipt/ui/receipt-form";
import { ReceiptPreview } from "@/widgets/receipt-preview/receipt-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-center text-4xl font-semibold mb-6">Geração de Recibo</h1>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <Card className="xl:col-span-7">
          <CardHeader><CardTitle className="sr-only">Dados do Recibo</CardTitle></CardHeader>
          <CardContent><ReceiptForm /></CardContent>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader><CardTitle className="text-sm">Preview</CardTitle></CardHeader>
          <CardContent><ReceiptPreview /></CardContent>
        </Card>
      </section>
    </main>
  );
}
