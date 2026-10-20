export enum UserType {
  OWNER = 'OWNER',
  PARTNER = 'PARTNER',
  COMPANY_FINANCIAL = 'COMPANY_FINANCIAL',
  EMPLOYEE = 'EMPLOYEE',
  STAFF = 'STAFF',
  COMPANY = 'COMPANY',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  FISCAL_ANALYST = 'FISCAL_ANALYST',
  PAYROLL_ANALYST = 'PAYROLL_ANALYST',
  // Papéis da Empresa (Company)
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  COMPANY_FINANCIAL = 'COMPANY_FINANCIAL',
  COMPANY_EMPLOYEE = 'COMPANY_EMPLOYEE',
  COMPANY = 'COMPANY',
  OWNER = 'OWNER',
  PARTNER = 'PARTNER',
}

export enum SystemModule {
  COMPANIES = 'COMPANIES',
  TIMELINE_TASKS = 'TIMELINE_TASKS',
  FISCAL = 'FISCAL',
  ACCOUNTING = 'ACCOUNTING',
  PAYROLL = 'PAYROLL',
  SYSTEM_SETTINGS = 'SYSTEM_SETTINGS',
}

export const STAFF_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ACCOUNTANT,
  UserRole.FISCAL_ANALYST,
  UserRole.PAYROLL_ANALYST,
];

export const COMPANY_ROLES: UserRole[] = [
  UserRole.COMPANY_ADMIN,
  UserRole.COMPANY_FINANCIAL,
  UserRole.COMPANY_EMPLOYEE,
  UserRole.COMPANY,
  UserRole.OWNER,
  UserRole.PARTNER,
];

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
  type?: UserType | string;
  role: UserRole;
  companyId?: string | UserCompany;
  company?: UserCompany;
  employeeId?: string;
  allowedModules?: SystemModule[];
  phone?: string;
  active?: boolean;
  isActive?: boolean;
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
