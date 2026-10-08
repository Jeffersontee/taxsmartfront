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

export interface ICompany {
  _id: string;
  corporateName: string;
  tradeName: string;
  cnpj: string;
  taxRegime: TaxRegime;
  cnaePrincipal: string;
  cnaesSecundarios?: string[];
  stateRegistration?: string;
  municipalRegistration?: string;
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
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
