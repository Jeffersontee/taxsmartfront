export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  FISCAL_ANALYST = 'FISCAL_ANALYST',
  PAYROLL_ANALYST = 'PAYROLL_ANALYST',
  CLIENT_ADMIN = 'CLIENT_ADMIN',
  CLIENT_FINANCIAL = 'CLIENT_FINANCIAL',
  CLIENT_EMPLOYEE = 'CLIENT_EMPLOYEE',
  CLIENT = 'CLIENT', // Mantido para compatibilidade retroativa
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

export const CLIENT_ROLES: UserRole[] = [
  UserRole.CLIENT,
  UserRole.CLIENT_ADMIN,
  UserRole.CLIENT_FINANCIAL,
  UserRole.CLIENT_EMPLOYEE,
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
  role: UserRole;
  companyId?: string | UserCompany;
  employeeId?: string;
  allowedModules?: SystemModule[];
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
