export type InvoiceType = 'NFE' | 'NFSE' | 'NFCE' | 'CTE';
export type InvoiceOperation = 'ENTRADA' | 'SAIDA';
export type InvoiceStatus = 'AUTORIZADA' | 'CANCELADA' | 'DENEGADA' | 'RASCUNHO';
export type TaxGuideType = 'DAS' | 'DARF_IRPJ' | 'DARF_CSLL' | 'DARF_PIS' | 'DARF_COFINS' | 'DARF_UNIFICADA' | 'ISS' | 'ICMS_GARE' | 'DCTF_WEB';
export type TaxGuideStatus = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';
export type SimplesAnexo = 'ANEXO_I' | 'ANEXO_II' | 'ANEXO_III' | 'ANEXO_IV' | 'ANEXO_V';

export interface IInvoiceEntity {
  cnpjCpf: string;
  name: string;
  tradeName?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  city?: string;
  state?: string;
}

export interface IInvoiceTaxes {
  iss?: { baseCalculo: number; aliquota: number; valor: number; retido: boolean };
  icms?: { baseCalculo: number; aliquota: number; valor: number };
  pis?: { baseCalculo: number; aliquota: number; valor: number; retido: boolean };
  cofins?: { baseCalculo: number; aliquota: number; valor: number; retido: boolean };
  irrf?: { baseCalculo: number; aliquota: number; valor: number; retido: boolean };
  csll?: { baseCalculo: number; aliquota: number; valor: number; retido: boolean };
  inss?: { baseCalculo: number; aliquota: number; valor: number; retido: boolean };
}

export interface IInvoice {
  _id?: string;
  companyId: string;
  invoiceNumber: string;
  series: string;
  type: InvoiceType;
  operation: InvoiceOperation;
  status: InvoiceStatus;
  issueDate: string | Date;
  competence: string;
  accessKey?: string;
  issuer: IInvoiceEntity;
  recipient: IInvoiceEntity;
  totalAmount: number;
  discountAmount?: number;
  netAmount: number;
  taxes?: IInvoiceTaxes;
  xmlUrl?: string;
  pdfUrl?: string;
  observations?: string;
  createdAt?: string;
}

export interface IInvoiceSummary {
  totalRevenue: number;
  totalExpenses: number;
  countSaida: number;
  countEntrada: number;
  totalRetainedISS: number;
  totalRetainedFederal: number;
}

export interface ITaxDetail {
  name: string;
  baseCalculation: number;
  rate: number;
  deduction?: number;
  amount: number;
  retainedAmount?: number;
}

export interface ITaxSimulation {
  companyId: string;
  competence: string;
  taxRegime: string;
  grossRevenue: number;
  effectiveRate: number;
  taxDetails: ITaxDetail[];
  totalTaxDue: number;
  totalTaxRetained: number;
  netTaxPayable: number;
  invoicesCount: number;
}

export interface ITaxGuide {
  _id?: string;
  companyId: string;
  taxCalculationId?: string;
  taskId?: string;
  title: string;
  type: TaxGuideType;
  competence: string;
  dueDate: string | Date;
  amount: number;
  fineAmount?: number;
  interestAmount?: number;
  totalAmount: number;
  barcode?: string;
  pixQrCode?: string;
  pixCopiaECola?: string;
  pdfUrl?: string;
  status: TaxGuideStatus;
  paidAt?: string | Date;
  paidAmount?: number;
}
