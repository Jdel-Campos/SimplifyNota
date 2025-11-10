// shared/types/receipt.ts
export type Receipt = {
  // Campos base
  client: string;            // compat: espelha payeeName
  eventName: string;
  value: string;             // pode vir formatado
  rawValue?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventLocation: string;
  city: string;
  jobDescription: string;
  valueInWords?: string;

  // Cabeçalho
  receiptNumber?: string;
  issueDate?: string;

  // Pagador (removido do form, mas pode existir no tipo se precisar no backend)
  payerName?: string;
  payerCnpj?: string;
  payerIeIm?: string;
  payerAddress?: string;
  payerCity?: string;
  payerState?: string;

  // Recebedor (visível no form)
  payeeName?: string;
  payeeCpfCnpj?: string;
  payeeAddress?: string;
  payeeCity?: string;
  payeeState?: string;

  // Pagamento / Referências
  paymentDate?: string;
  paymentMethod?: string;
  purchaseOrder?: string;    // OS interna
  costCenter?: string;
  internalRef?: string;

  // Retenções (opcional – controladas por enableTaxes)
  taxes?: {
    iss?: number | string;
    inss?: number | string;
    irrf?: number | string;
    other?: number | string;
  };
  enableTaxes?: boolean;

  showNFNote?: boolean;
};
