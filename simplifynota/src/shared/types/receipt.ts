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

  payerName?: string;
  payerCnpj?: string;
  payerIeIm?: string;
  payerAddress?: string;
  payerCity?: string;
  payerState?: string;

  payeeName?: string;
  payeeCpfCnpj?: string;
  payeeAddress?: string;
  payeeCity?: string;
  payeeState?: string;

  paymentDate?: string;
  paymentMethod?: string;
  purchaseOrder?: string;
  costCenter?: string;
  internalRef?: string;

  enableTaxes?: boolean;
  enableSupplierDetails?: boolean;

  taxes?: {
    iss?: number | string;
    inss?: number | string;
    irrf?: number | string;
    other?: number | string;
  };

  showNFNote?: boolean;

  supplier?: {
    phone?: string;
    email?: string;
    contactName?: string;
    emergencyContact?: string;

    bank?: {
      bankName?: string;
      accountType?: "Corrente" | "Poupança";
      agency?: string;
      account?: string;
      pixKey?: string;
    };

    stateRegistration?: string;
    municipalRegistration?: string;

    productServiceType?: string;

    paymentTerms?: string;
    discountPolicy?: string;
    previousDeals?: string;

    nfCnpj?: string;
    nfCity?: string;
    nfNotes?: string;

    serviceHours?: string;
    availability?: string;
  };
};