// features/create-receipt/ui/receipt-form.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import extenso from "extenso";
import type { Receipt } from "@/shared/types/receipt";
import { parseCurrencyBR, formatCurrencyBR } from "@/shared/lib/currency";
import { receiptSchema } from "@/entities/receipts/schema";
import { generatePDF } from "@/features/generate-pdf/lib/generate-pdf";
import { useReceiptStore, initialReceipt } from "@/shared/state/receipt-store";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import {
  Calendar, Clock, MapPin, DollarSign, User, Building, FileText as FileIcon,
} from "lucide-react";
import { generateLocalOS, generateInternalRef } from "@/shared/lib/ids";

export type PayeeSeed = {
  name: string;
  cpfCnpj: string;
  address?: string;
  city?: string;
  state?: string;
};

type Props = {
  initialPayee?: PayeeSeed; // pré-preenche recebedor (editável)
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
      <h2 className="text-lg font-semibold text-gray-800">{children}</h2>
    </div>
  );
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="rounded-xl border border-gray-200 bg-white/60 open:bg-white/80 shadow-sm" open={defaultOpen}>
      <summary className="cursor-pointer list-none select-none px-4 py-3 flex items-center justify-between">
        <span className="font-medium text-gray-800">{title}</span>
        <span className="text-gray-500">▾</span>
      </summary>
      <div className="px-4 pb-4 pt-2">{children}</div>
    </details>
  );
}

export function ReceiptForm({ initialPayee }: Props) {
  const [formData, setFormData] = useState<Receipt>({
    ...initialReceipt,
    issueDate: new Date().toISOString(),
    showNFNote: true,
    enableTaxes: false,

    // recebedor visível/editável
    payeeName: initialPayee?.name ?? "",
    payeeCpfCnpj: initialPayee?.cpfCnpj ?? "",
    payeeAddress: initialPayee?.address ?? "",
    payeeCity: initialPayee?.city ?? "",
    payeeState: initialPayee?.state ?? "",
    client: initialPayee?.name ?? initialReceipt.client,
  });
  const [submitting, setSubmitting] = useState(false);
  const receiptStore = useReceiptStore();

  const bootstrapped = useRef(false);

  const sync = (next: Receipt) => {
    setFormData(next);
    receiptStore.setAll(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;

    if (name === "value") {
      const numeric = parseCurrencyBR(value);
      sync({
        ...formData,
        value,
        rawValue: value,
        valueInWords: numeric !== null ? String(extenso(numeric, { mode: "currency" })) : "",
      });
      return;
    }

    if (name === "payeeName") {
      sync({ ...formData, payeeName: value, client: value });
      return;
    }

    if (["taxes.iss", "taxes.inss", "taxes.irrf", "taxes.other"].includes(name)) {
      const [, key] = name.split(".");
      sync({ ...formData, taxes: { ...(formData.taxes ?? {}), [key]: value } });
      return;
    }

    if (type === "checkbox") {
      sync({ ...formData, [name]: checked });
      return;
    }

    sync({ ...formData, [name]: value });
  };

  const handleFocusValue = () => {
    sync({ ...formData, value: formData.rawValue || formData.value });
  };
  const handleBlurValue = () => {
    sync({ ...formData, value: formatCurrencyBR(formData.rawValue || formData.value) });
  };
  const handleBlurTax = (key: "iss" | "inss" | "irrf" | "other") => {
    const current = String((formData.taxes as any)?.[key] ?? "");
    const formatted = current ? formatCurrencyBR(current) : "";
    sync({ ...formData, taxes: { ...(formData.taxes ?? {}), [key]: formatted } });
  };

  const fetchReceiptNumber = async () => {
    try {
      const res = await fetch("/api/receipts/next-number", { cache: "no-store" });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      return data.number as string;
    } catch {
      const d = new Date();
      return `REC-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}${String(
        d.getDate()
      ).padStart(2, "0")}-${Math.random().toString(36).slice(-4).toUpperCase()}`;
    }
  };

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      const next: Receipt = { ...formData };
      if (!next.receiptNumber) next.receiptNumber = await fetchReceiptNumber();
      if (!next.purchaseOrder) next.purchaseOrder = generateLocalOS();
      if (!next.internalRef) next.internalRef = generateInternalRef(next.eventName, next.eventDate);
      if (!next.client && next.payeeName) next.client = next.payeeName;
      sync(next);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const auto = generateInternalRef(formData.eventName, formData.eventDate);
    if (auto !== formData.internalRef) sync({ ...formData, internalRef: auto });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.eventName, formData.eventDate]);

  const toggleTaxes = (on: boolean) => {
    const next = { ...formData, enableTaxes: on };
    next.taxes = on ? (formData.taxes ?? {}) : undefined;
    sync(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const rawValue = formData.rawValue ?? formData.value ?? "";
    const payload: Receipt = {
      ...formData,
      value: formData.value || formatCurrencyBR(rawValue),
    };
    const parsed = receiptSchema.safeParse(payload);
    if (!parsed.success) {
      setSubmitting(false);
      alert(parsed.error.issues[0]?.message ?? "Preencha os campos obrigatórios.");
      return;
    }

    try {
      await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, value: rawValue }),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: "Erro inesperado." }));
          throw new Error(err.message || "Erro ao salvar nota.");
        }
      });

      await generatePDF({ ...payload, value: rawValue }); // PDF formata internamente

      const reset: Receipt = {
        ...initialReceipt,
        issueDate: new Date().toISOString(),
        showNFNote: true,
        enableTaxes: false,
        payeeName: formData.payeeName,
        payeeCpfCnpj: formData.payeeCpfCnpj,
        payeeAddress: formData.payeeAddress,
        payeeCity: formData.payeeCity,
        payeeState: formData.payeeState,
        client: formData.payeeName ?? initialReceipt.client,
      };

      bootstrapped.current = false;
      sync(reset);
      useReceiptStore.getState().reset();
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      alert("Erro ao salvar a nota");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1) Informações Principais */}
      <div className="space-y-5">
        <SectionTitle>Informações Principais</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="group md:col-span-1">
            <Label required>
              <span className="inline-flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Nome do Recebedor
              </span>
            </Label>
            <Input
              name="payeeName"
              value={formData.payeeName}
              onChange={handleInputChange}
              placeholder="Nome/Razão Social"
              className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all"
              required
            />
          </div>

          <div className="group md:col-span-1">
            <Label required>
              <span className="inline-flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                Nome do Evento
              </span>
            </Label>
            <Input
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              placeholder="Nome do evento"
              className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all"
              required
            />
          </div>

          <div className="group md:col-span-1">
            <Label required>
              <span className="inline-flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Valor (R$)
              </span>
            </Label>
            <Input
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              onFocus={handleFocusValue}
              onBlur={handleBlurValue}
              inputMode="decimal"
              placeholder="0,00"
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl focus:border-green-500 text-lg font-semibold text-green-700"
              required
              autoComplete="off"
            />
            {Boolean(formData.valueInWords) && (
              <p className="mt-2 text-xs text-gray-500 italic">{formData.valueInWords}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2) Data e Horário */}
      <div className="space-y-5 pt-4 border-t border-gray-100">
        <SectionTitle>Data e Horário</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="group">
            <Label required><span className="inline-flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-600" />Data do Evento</span></Label>
            <Input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500" required />
          </div>
          <div className="group">
            <Label required><span className="inline-flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-600" />Horário de Início</span></Label>
            <Input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500" required />
          </div>
          <div className="group">
            <Label required><span className="inline-flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-600" />Horário de Término</span></Label>
            <Input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500" required />
          </div>
        </div>
      </div>

      {/* 3) Localização */}
      <div className="space-y-5 pt-4 border-t border-gray-100">
        <SectionTitle>Localização</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="group">
            <Label required><span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-purple-600" />Local do Evento</span></Label>
            <Input name="eventLocation" value={formData.eventLocation} onChange={handleInputChange} placeholder="Endereço do evento" className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500" required />
          </div>
          <div className="group">
            <Label required><span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-purple-600" />Cidade</span></Label>
            <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Cidade" className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500" required />
          </div>
        </div>
      </div>

      {/* 4) Descrição */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <Label required><span className="inline-flex items-center gap-2"><FileIcon className="w-4 h-4 text-blue-600" />Descrição do Trabalho</span></Label>
        <Textarea name="jobDescription" value={formData.jobDescription} onChange={handleInputChange} rows={4} placeholder="Descreva o trabalho realizado..." className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 resize-none" required />
      </div>

      {/* Recebedor (editável) */}
      <Accordion title="Detalhes do Recebedor">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="payeeCpfCnpj" placeholder="CPF/CNPJ" value={formData.payeeCpfCnpj ?? ""} onChange={handleInputChange} />
          <Input name="payeeAddress" placeholder="Endereço" value={formData.payeeAddress ?? ""} onChange={handleInputChange} className="md:col-span-2" />
          <Input name="payeeCity" placeholder="Cidade" value={formData.payeeCity ?? ""} onChange={handleInputChange} />
          <Input name="payeeState" placeholder="UF" value={formData.payeeState ?? ""} onChange={handleInputChange} />
        </div>
      </Accordion>

      {/* Pagamento & Preferências */}
      <Accordion title="Pagamento & Preferências">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input name="paymentMethod" placeholder="Forma de pagamento (PIX, TED...)" value={formData.paymentMethod ?? ""} onChange={handleInputChange} />
          <Input type="date" name="paymentDate" placeholder="Data do pagamento" value={formData.paymentDate ?? ""} onChange={handleInputChange} />
          <Input name="costCenter" placeholder="Centro de Custo" value={formData.costCenter ?? ""} onChange={handleInputChange} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="showNFNote" checked={!!formData.showNFNote} onChange={handleInputChange} />
            Exibir observação fiscal no recibo
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={!!formData.enableTaxes} onChange={(e) => toggleTaxes(e.target.checked)} />
            Aplicar retenções
          </label>
        </div>

        {formData.enableTaxes && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
            <Input name="taxes.iss"  placeholder="ISS (R$)"  value={String(formData.taxes?.iss ?? "")}  onChange={handleInputChange} onBlur={() => handleBlurTax("iss")}  inputMode="decimal" />
            <Input name="taxes.inss" placeholder="INSS (R$)" value={String(formData.taxes?.inss ?? "")} onChange={handleInputChange} onBlur={() => handleBlurTax("inss")} inputMode="decimal" />
            <Input name="taxes.irrf" placeholder="IRRF (R$)" value={String(formData.taxes?.irrf ?? "")} onChange={handleInputChange} onBlur={() => handleBlurTax("irrf")} inputMode="decimal" />
            <Input name="taxes.other" placeholder="Outras (R$)" value={String(formData.taxes?.other ?? "")} onChange={handleInputChange} onBlur={() => handleBlurTax("other")} inputMode="decimal" />
          </div>
        )}
      </Accordion>

      {/* CTA */}
      <div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Gerando..." : "Gerar Recibo"}
        </Button>
      </div>
    </form>
  );
}
