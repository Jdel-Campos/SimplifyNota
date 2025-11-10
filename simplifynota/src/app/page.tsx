// app/page.tsx
import { FileText } from "lucide-react";
import { ReceiptForm } from "@/features/create-receipt/ui/receipt-form";
import { ReceiptPreview } from "@/widgets/receipt-preview/receipt-preview";
import { PreviewDialogTrigger } from "@/widgets/receipt-preview/preview-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { LiveBadge } from "@/shared/ui/live-badge";

// Exemplo opcional: injete recebedor do banco via Server Component
// import { getCurrentUser } from "@/server/auth";

export default async function Home() {
  // const user = await getCurrentUser();
  // const initialPayee = { name: user?.name ?? "", cpfCnpj: user?.cpfCnpj ?? "", address: user?.address ?? "", city: user?.city ?? "", state: user?.state ?? "" };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-6 md:mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Geração de Recibo
          </h1>
          <p className="text-gray-600">Crie recibos profissionais de forma rápida e fácil</p>
        </div>

        {/* Botão de preview apenas em telas menores */}
        <div className="flex justify-center mb-4 xl:hidden">
          <PreviewDialogTrigger label="Ver preview" />
        </div>

        {/* Grid principal */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* PREVIEW — visível só no desktop */}
          <Card className="hidden xl:block xl:col-span-7 2xl:col-span-8 sticky top-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm text-gray-600 uppercase tracking-wide">Preview</CardTitle>
              <div className="absolute right-6 top-6">
                <LiveBadge />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <ReceiptPreview />
            </CardContent>
          </Card>

          {/* FORM */}
          <Card className="xl:col-span-5 2xl:col-span-4 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
            <CardHeader>
              <CardTitle className="sr-only">Dados do Recibo</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Passe initialPayee se quiser pré-preencher do banco */}
              {/* <ReceiptForm initialPayee={initialPayee} /> */}
              <ReceiptForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
