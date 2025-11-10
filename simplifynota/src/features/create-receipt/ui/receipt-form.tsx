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
import { Select } from "@/shared/ui/select";
import {
  Calendar, Clock, MapPin, DollarSign, User, Building, Percent,
  IdCard, Phone, Mail, Landmark, Building2, Tag, CalendarClock, FileText as FileIcon,
  CreditCard,
} from "lucide-react";
import { generateLocalOS, generateInternalRef } from "@/shared/lib/ids";
import { resolveCostCenter } from "@/shared/lib/cost-center";

// Helper para set nested path (supplier.xxx / supplier.bank.xxx / taxes.xxx)
function setByPath<T extends Record<string, any>>(obj: T, path: string, value: any): T {
  const keys = path.split(".");
  const clone: any = { ...obj };
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cur[k] = { ...(cur[k] ?? {}) };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

type PayeeSeed = {
  name: string;
  cpfCnpj: string;
  address?: string;
  city?: string;
  state?: string;
};

type Props = { initialPayee?: PayeeSeed };

// Acordeão controlado
type CollapsibleProps = {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};
function Collapsible({ title, icon: Icon, open, onOpenChange, children }: CollapsibleProps) {
  return (
    <details
      open={open}
      onToggle={(e) => onOpenChange((e.currentTarget as HTMLDetailsElement).open)}
      className="rounded-xl border border-gray-200 bg-white/60 open:bg-white/80 shadow-sm"
    >
      <summary className="cursor-pointer list-none select-none px-4 py-3 flex items-center gap-2">
        {Icon ? <Icon className="w-4 h-4 text-blue-600" /> : null}
        <span className="font-medium text-gray-800">{title}</span>
        <span className="ml-auto text-gray-500">{open ? "▴" : "▾"}</span>
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
    enableSupplierDetails: false,

    // Recebedor seed
    payeeName: initialPayee?.name ?? "",
    payeeCpfCnpj: initialPayee?.cpfCnpj ?? "",
    payeeAddress: initialPayee?.address ?? "",
    payeeCity: initialPayee?.city ?? "",
    payeeState: initialPayee?.state ?? "",
    client: initialPayee?.name ?? initialReceipt.client,
  });
  const [submitting, setSubmitting] = useState(false);

  // Controle dos acordeões
  const [openMain, setOpenMain] = useState(true);
  const [openDate, setOpenDate] = useState(true);
  const [openLoc, setOpenLoc] = useState(true);
  const [openPay, setOpenPay] = useState(false);

  const receiptStore = useReceiptStore();
  const bootstrapped = useRef(false);

  const sync = (next: Receipt) => {
    setFormData(next);
    receiptStore.setAll(next);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as any;
    const { name, value, type, checked } = target;

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

    // nested: taxes.*, supplier.*, supplier.bank.*
    if (name.includes(".")) {
      sync(setByPath(formData, name, type === "checkbox" ? checked : value));
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

  // toggles
  const toggleTaxes = (on: boolean) => {
    const next = { ...formData, enableTaxes: on };
    next.taxes = on ? (formData.taxes ?? {}) : undefined;
    sync(next);
  };
  const toggleSupplierDetails = (on: boolean) => {
    let next = { ...formData, enableSupplierDetails: on };
    if (!on) {
      // limpa bloco avançado
      delete (next as any).supplier;
      next.payeeAddress = "";
      next.payeeCity = "";
      next.payeeState = "";
    } else {
      next = setByPath(next, "supplier", { ...(formData.supplier ?? {}) });
    }
    sync(next);
  };

  // automações
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
      if (!next.internalRef)   next.internalRef   = generateInternalRef(next.eventName, next.eventDate);
      if (!next.costCenter)    next.costCenter    = await resolveCostCenter(next.eventName, next.eventDate);
      if (!next.client && next.payeeName) next.client = next.payeeName;
      sync(next);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      const ref = generateInternalRef(formData.eventName, formData.eventDate);
      const cc  = await resolveCostCenter(formData.eventName, formData.eventDate);
      if (ref !== formData.internalRef || cc !== formData.costCenter) {
        sync({ ...formData, internalRef: ref, costCenter: cc });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.eventName, formData.eventDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload: Receipt = {
      ...formData,
      value: formData.value || formatCurrencyBR(formData.rawValue ?? ""),
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
        body: JSON.stringify({ ...payload, value: payload.rawValue }),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: "Erro inesperado." }));
          throw new Error(err.message || "Erro ao salvar nota.");
        }
      });

      await generatePDF({ ...payload, value: payload.rawValue ?? payload.value });

      const reset: Receipt = {
        ...initialReceipt,
        issueDate: new Date().toISOString(),
        showNFNote: true,
        enableTaxes: false,
        enableSupplierDetails: false,
        payeeName: formData.payeeName ?? "",
        payeeCpfCnpj: formData.payeeCpfCnpj ?? "",
        client: formData.payeeName ?? "",
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

  // Handlers para acordes: pagamento fecha os demais; abrir qualquer outro fecha o pagamento
  const onToggleMain = (open: boolean) => {
    setOpenMain(open);
    if (open && openPay) setOpenPay(false);
  };
  const onToggleDate = (open: boolean) => {
    setOpenDate(open);
    if (open && openPay) setOpenPay(false);
  };
  const onToggleLoc = (open: boolean) => {
    setOpenLoc(open);
    if (open && openPay) setOpenPay(false);
  };
  const onTogglePay = (open: boolean) => {
    setOpenPay(open);
    if (open) {
      setOpenMain(false);
      setOpenDate(false);
      setOpenLoc(false);
    }
  };

  return (
    
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1) Informações Principais (Accordion) */}
      <Collapsible title="Informações Principais" icon={User} open={openMain} onOpenChange={onToggleMain}>
        <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-3 gap-5">
          <div className="group min-w-0">
            <Label className="required">
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
              required
            />
          </div>

          <div className="group min-w-0">
            <Label className="required">
              <span className="inline-flex items-center gap-2">
                <IdCard className="w-4 h-4 text-blue-600" />
                CPF/CNPJ
              </span>
            </Label>
            <Input
              name="payeeCpfCnpj"
              value={formData.payeeCpfCnpj ?? ""}
              onChange={handleInputChange}
              placeholder="___.___.___-__ / __.___.___/____-__"
              required
            />
          </div>

          <div className="grid grid-cols-1">
            <div className="group min-w-0">
              <Label className="required">
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
                required
              />
            </div>
          </div>

          <div className="group min-w-0">
            <Label className="required">
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
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-[15px] font-semibold text-green-700"
              required
              autoComplete="off"
            />
            {Boolean(formData.valueInWords) && (
              <p className="mt-2 text-xs text-gray-500 italic">{formData.valueInWords}</p>
            )}
          </div>
        </div>
      </Collapsible>

      {/* 2) Data e Horário (Accordion) */}
      <Collapsible title="Data e Horário" icon={Calendar} open={openDate} onOpenChange={onToggleDate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="group min-w-0 md:col-span-2">
            <Label className="required">
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Data do Evento
              </span>
            </Label>
            <Input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required />
          </div>
          <div className="group min-w-0">
            <Label className="required">
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Horário de Início
              </span>
            </Label>
            <Input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required />
          </div>
          <div className="group min-w-0">
            <Label className="required">
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Horário de Término
              </span>
            </Label>
            <Input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required />
          </div>
        </div>
      </Collapsible>

      {/* 3) Localização (Accordion) */}
      <Collapsible title="Localização" icon={MapPin} open={openLoc} onOpenChange={onToggleLoc}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="group min-w-0">
            <Label className="required">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Local do Evento
              </span>
            </Label>
            <Input
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleInputChange}
              placeholder="Endereço do evento"
              required
            />
          </div>
          <div className="group min-w-0">
            <Label className="required">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Cidade
              </span>
            </Label>
            <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Cidade" required />
          </div>
        </div>
      </Collapsible>

      {/* 4) Descrição (fora dos acordeões, como você já tinha) */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <Label className="required">
          <span className="inline-flex items-center gap-2">
            <FileIcon className="w-4 h-4 text-blue-600" />
            Descrição do Trabalho
          </span>
        </Label>
        <Textarea
          name="jobDescription"
          value={formData.jobDescription}
          onChange={handleInputChange}
          rows={4}
          placeholder="Descreva o trabalho realizado..."
          className="resize-none"
          required
        />
      </div>

      {/* 5) Pagamento & Preferências (Accordion controlado) */}
      <Collapsible title="Pagamento & Preferências" icon={CreditCard} open={openPay} onOpenChange={onTogglePay}>
        <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="group min-w-0">
            <Label>Forma de pagamento</Label>
            <Select name="paymentMethod" value={formData.paymentMethod ?? ""} onChange={handleInputChange}>
              <option value="" disabled>Selecione</option>
              <option value="Pix">Pix</option>
              <option value="Boleto">Boleto</option>
              <option value="Depósito (TED)">Depósito (TED)</option>
            </Select>
          </div>
          <div className="group min-w-0">
            <Label>Data do pagamento</Label>
            <Input type="date" name="paymentDate" value={formData.paymentDate ?? ""} onChange={handleInputChange} />
          </div>
          {/* <div className="group min-w-0">
            <Label>Referência Interna (auto)</Label>
            <Input name="internalRef" value={formData.internalRef ?? ""} readOnly />
          </div> */}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-6">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!formData.enableSupplierDetails}
              onChange={(e) => toggleSupplierDetails(e.target.checked)}
            />
            Incluir detalhes do fornecedor
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!formData.enableTaxes}
              onChange={(e) => toggleTaxes(e.target.checked)}
            />
            Aplicar retenções
          </label>
        </div>

        {/* Detalhes avançados do fornecedor */}
        {formData.enableSupplierDetails && (
          <div className="mt-4 space-y-4">
            {/* Contatos */}
            <div>
              <div className="mb-2 font-medium text-gray-800 inline-flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" /> Contatos
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4">
                <Input name="supplier.contactName" placeholder="Responsável" value={formData.supplier?.contactName ?? ""} onChange={handleInputChange} />
                <Input name="supplier.phone" placeholder="Telefone" value={formData.supplier?.phone ?? ""} onChange={handleInputChange} />
                <Input name="supplier.email" placeholder="E-mail" value={formData.supplier?.email ?? ""} onChange={handleInputChange} />
                <Input name="supplier.emergencyContact" placeholder="Contato de emergência" value={formData.supplier?.emergencyContact ?? ""} onChange={handleInputChange} />
              </div>
            </div>

            {/* Bancários */}
            <div>
  <div className="mb-2 font-medium text-gray-800 inline-flex items-center gap-2">
    <Landmark className="w-4 h-4 text-blue-600" /> Dados bancários
  </div>

  {/* 1 col no mobile, 2 col ≥ md */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      name="supplier.bank.bankName"
      placeholder="Banco"
      value={formData.supplier?.bank?.bankName ?? ""}
      onChange={handleInputChange}
      className="md:col-span-1"
    />
    <Select
      name="supplier.bank.accountType"
      value={formData.supplier?.bank?.accountType ?? ""}
      onChange={handleInputChange}
      className="w-full"
    >
      <option value="" disabled>Tipo de conta</option>
      <option value="Corrente">Corrente</option>
      <option value="Poupança">Poupança</option>
    </Select>
    <Input
      name="supplier.bank.agency"
      placeholder="Agência"
      value={formData.supplier?.bank?.agency ?? ""}
      onChange={handleInputChange}
    />
    <Input
      name="supplier.bank.account"
      placeholder="Conta"
      value={formData.supplier?.bank?.account ?? ""}
      onChange={handleInputChange}
    />
    <Input
      name="supplier.bank.pixKey"
      placeholder="Chave Pix (opcional)"
      value={formData.supplier?.bank?.pixKey ?? ""}
      onChange={handleInputChange}
      className="md:col-span-2"
    />
  </div>
</div>

            {/* Inscrições */}
            <div>
              <div className="mb-2 font-medium text-gray-800 inline-flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Inscrições
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4">
                <Input name="payeeAddress" placeholder="Endereço (opcional)" value={formData.payeeAddress ?? ""} onChange={handleInputChange} className="sm:col-span-2"/>
                <Input name="payeeCity" placeholder="Cidade (opcional)" value={formData.payeeCity ?? ""} onChange={handleInputChange} className="sm:col-span-1"/>
                <Input name="payeeState" placeholder="UF (opcional)" value={formData.payeeState ?? ""} onChange={handleInputChange} className="sm:col-span-1"/>
                <Input name="supplier.stateRegistration" placeholder="Inscrição Estadual (IE)" value={formData.supplier?.stateRegistration ?? ""} onChange={handleInputChange} className="sm:col-span-1"/>
                <Input name="supplier.municipalRegistration" placeholder="Inscrição Municipal (IM)" value={formData.supplier?.municipalRegistration ?? ""} onChange={handleInputChange} className="sm:col-span-1"/>
              </div>
            </div>

            {/* Classificação */}
            <div>
              <div className="mb-2 font-medium text-gray-800 inline-flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" /> Classificação
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                <Input name="supplier.productServiceType" placeholder="Tipo de produto/serviço" value={formData.supplier?.productServiceType ?? ""} onChange={handleInputChange} />
              </div>
            </div>

            {/* Condições comerciais */}
            <div>
              <div className="mb-2 font-medium text-gray-800 inline-flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-blue-600" /> Condições comerciais
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select name="supplier.paymentTerms" value={formData.supplier?.paymentTerms ?? ""} onChange={handleInputChange}>
                  <option value="" disabled>Prazo</option>
                  <option value="À vista">À vista</option>
                  <option value="15 dias">15 dias</option>
                  <option value="30 dias">30 dias</option>
                  <option value="45 dias">45 dias</option>
                  <option value="60 dias">60 dias</option>
                </Select>
                <Input name="supplier.discountPolicy" placeholder="Descontos (ex.: 5%)" value={formData.supplier?.discountPolicy ?? ""} onChange={handleInputChange} />
                <div className="md:col-span-3">
                  <Textarea name="supplier.previousDeals" placeholder="Negociações anteriores (observações)" rows={2} value={formData.supplier?.previousDeals ?? ""} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* NF */}
            <div>
  <div className="mb-2 font-medium text-gray-800 inline-flex items-center gap-2">
    <Mail className="w-4 h-4 text-blue-600" /> Dados para NF
  </div>

  {/* 1 col no mobile, 2 col ≥ md */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      name="supplier.nfCnpj"
      placeholder="CNPJ para NF (se diferente)"
      value={formData.supplier?.nfCnpj ?? ""}
      onChange={handleInputChange}
    />
    <Input
      name="supplier.nfCity"
      placeholder="Cidade para NF"
      value={formData.supplier?.nfCity ?? ""}
      onChange={handleInputChange}
    />
    <Input
      name="supplier.nfNotes"
      placeholder="Observações NF (opcional)"
      value={formData.supplier?.nfNotes ?? ""}
      onChange={handleInputChange}
      className="md:col-span-2"
    />
  </div>
</div>


            {/* Horários/Disponibilidade */}
            <div>
              <div className="mb-2 font-medium text-gray-800 inline-flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Horários & disponibilidade
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="supplier.serviceHours" placeholder="Horário de atendimento (ex.: 9h–18h, seg–sex)" value={formData.supplier?.serviceHours ?? ""} onChange={handleInputChange} />
                <Textarea name="supplier.availability" placeholder="Disponibilidade / SLA / plantão" rows={2} value={formData.supplier?.availability ?? ""} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        )}

        {/* Retenções — somente quando habilitado */}
        {formData.enableTaxes && (
          <div className="mt-4">
            <div className="mb-2 font-medium text-gray-800 inline-flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-600" />
              Retenções
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4">
              <Input
                name="taxes.iss"
                placeholder="ISS (R$)"
                value={String(formData.taxes?.iss ?? "")}
                onChange={handleInputChange}
                onBlur={() => handleBlurTax("iss")}
                inputMode="decimal"
              />
              <Input
                name="taxes.inss"
                placeholder="INSS (R$)"
                value={String(formData.taxes?.inss ?? "")}
                onChange={handleInputChange}
                onBlur={() => handleBlurTax("inss")}
                inputMode="decimal"
              />
              <Input
                name="taxes.irrf"
                placeholder="IRRF (R$)"
                value={String(formData.taxes?.irrf ?? "")}
                onChange={handleInputChange}
                onBlur={() => handleBlurTax("irrf")}
                inputMode="decimal"
              />
              <Input
                name="taxes.other"
                placeholder="Outras (R$)"
                value={String(formData.taxes?.other ?? "")}
                onChange={handleInputChange}
                onBlur={() => handleBlurTax("other")}
                inputMode="decimal"
              />
            </div>
          </div>
        )}
      </Collapsible>

      {/* CTA */}
      <div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Gerando..." : "Gerar Recibo"}
        </Button>
      </div>
    </form>
  );
}
