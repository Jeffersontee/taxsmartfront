export enum TaxRegime {
  SIMPLES_NACIONAL = 'SIMPLES_NACIONAL',
  LUCRO_PRESUMIDO = 'LUCRO_PRESUMIDO',
  LUCRO_REAL = 'LUCRO_REAL',
  MEI = 'MEI',
}

export interface IPartner {
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  quotaPercentage?: number;
  isResponsible: boolean;
}

export interface ICompanyResponsibles {
  fiscalResponsibleId?: any;
  accountingResponsibleId?: any;
  payrollResponsibleId?: any;
  legalResponsibleId?: any;
}

export interface ICompany {
  _id: string;
  code?: string;
  corporateName: string;
  tradeName: string;
  cnpj: string;
  taxRegime: TaxRegime;
  regimeEstadual?: string;
  regimeMunicipal?: string;
  cnaePrincipal: string;
  cnaesSecundarios?: string[];
  stateRegistration?: string;
  municipalRegistration?: string;
  openingDate?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  partners: IPartner[];
  assignedResponsibles?: ICompanyResponsibles;
  allowLooseDocumentUpload?: boolean;
  notifyClient?: boolean;
  monthlyPayment?: number | string;
  paymentDueDay?: number;
  active: boolean;
  size?: 'MEI' | 'ME' | 'EPP' | 'MEDIA_GRANDE' | string;
  allowedModules?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
