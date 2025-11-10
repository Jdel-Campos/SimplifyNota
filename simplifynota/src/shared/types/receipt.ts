// shared/types/receipt.ts
export type Receipt = {
  client: string;
  eventName: string;
  value: string;
  rawValue?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventLocation: string;
  city: string;
  jobDescription: string;
  valueInWords?: string;

  receiptNumber?: string;
  issueDate?: string;

  // Pagador (caso use)
  payerName?: string;
  payerCnpj?: string;
  payerIeIm?: string;
  payerAddress?: string;
  payerCity?: string;
  payerState?: string;

  // Recebedor (dados essenciais)
  payeeName?: string;
  payeeCpfCnpj?: string;
  payeeAddress?: string;
  payeeCity?: string;
  payeeState?: string;

  // Pagamento / Referências
  paymentDate?: string;
  paymentMethod?: string;
  purchaseOrder?: string;
  costCenter?: string;
  internalRef?: string;

  // Flags de UI
  enableTaxes?: boolean;
  enableSupplierDetails?: boolean;

  // Retenções
  taxes?: {
    iss?: number | string;
    inss?: number | string;
    irrf?: number | string;
    other?: number | string;
  };

  showNFNote?: boolean;

  // -------- NOVO: Metadados avançados de fornecedor (tudo opcional) --------
  supplier?: {
    // Contatos
    phone?: string;
    email?: string;
    contactName?: string;
    emergencyContact?: string;

    // Bancários
    bank?: {
      bankName?: string;
      accountType?: "Corrente" | "Poupança";
      agency?: string;
      account?: string;
      pixKey?: string;
    };

    // Inscrições
    stateRegistration?: string;     // IE
    municipalRegistration?: string; // IM

    // Classificação
    productServiceType?: string;

    // Condições comerciais
    paymentTerms?: string;    // ex.: À vista, 15 dias, 30 dias...
    discountPolicy?: string;  // ex.: % ou descrição
    previousDeals?: string;   // histórico breve

    // NF
    nfCnpj?: string;          // se diferente do CPF/CNPJ do recebedor
    nfCity?: string;
    nfNotes?: string;

    // Disponibilidade
    serviceHours?: string;    // horários
    availability?: string;    // observações
  };
};
