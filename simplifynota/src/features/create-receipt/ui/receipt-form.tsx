"use client";

import { useState } from "react";
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

export function ReceiptForm() {
  const [formData, setFormData] = useState<Receipt>(initialReceipt);
  const [submitting, setSubmitting] = useState(false);
  const receiptStore = useReceiptStore();

  const sync = (next: Receipt) => {
    setFormData(next);
    receiptStore.setAll(next);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as { name: keyof Receipt; value: string };

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

    sync({ ...formData, [name]: value });
  };

  const handleFocusValue = () => {
    sync({ ...formData, value: formData.rawValue || formData.value });
  };

  const handleBlurValue = () => {
    sync({ ...formData, value: formatCurrencyBR(formData.rawValue || formData.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload: Receipt = {
      ...formData,
      value: formData.value || formatCurrencyBR(formData.rawValue),
    };

    const parsed = receiptSchema.safeParse(payload);
    if (!parsed.success) {
      setSubmitting(false);
      alert(parsed.error.issues[0]?.message ?? "Preencha os campos obrigatórios.");
      return;
    }

    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, value: payload.rawValue }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Erro inesperado." }));
        alert(`Erro ao salvar nota: ${err.message}`);
        setSubmitting(false);
        return;
      }

      await generatePDF({ ...payload, value: formatCurrencyBR(payload.value) });

      sync(initialReceipt);
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
      {/* Linha 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label className="required">Nome do Recebedor</Label>
          <Input name="client" value={formData.client} onChange={handleInputChange} required />
        </div>

        <div>
          <Label className="required">Nome do Evento</Label>
          <Input name="eventName" value={formData.eventName} onChange={handleInputChange} required />
        </div>

        <div>
          <Label className="required">Valor (R$)</Label>
          <Input
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            onFocus={handleFocusValue}
            onBlur={handleBlurValue}
            inputMode="decimal"
            placeholder="0,00"
            required
          />
        </div>
      </div>

      {/* Linha 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label className="required">Data do Evento</Label>
          <Input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required />
        </div>
        <div>
          <Label className="required">Horário de Início</Label>
          <Input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required />
        </div>
        <div>
          <Label className="required">Horário de Término</Label>
          <Input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required />
        </div>
      </div>

      {/* Linha 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="required">Local do Evento</Label>
          <Input name="eventLocation" value={formData.eventLocation} onChange={handleInputChange} required />
        </div>
        <div>
          <Label className="required">Cidade</Label>
          <Input name="city" value={formData.city} onChange={handleInputChange} required />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <Label className="required">Descrição do Trabalho</Label>
        <Textarea name="jobDescription" value={formData.jobDescription} onChange={handleInputChange} rows={4} required />
      </div>

      {/* CTA */}
      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Gerando..." : "Gerar Recibo"}
        </Button>
      </div>
    </form>
  );
}
