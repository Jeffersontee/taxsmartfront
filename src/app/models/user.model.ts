export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  CLIENT = 'CLIENT',
}

export interface UserCompany {
  _id: string;
  corporateName?: string;
  tradeName?: string;
  name?: string;
  cnpj?: string;
  taxRegime?: string;
  tax_regime?: string;
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string | UserCompany;
  phone?: string;
  active?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}
