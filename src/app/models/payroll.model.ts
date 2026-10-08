export enum EmployeeType {
  CLT = 'CLT',
  PRO_LABORE = 'PRO_LABORE',
  ESTAGIARIO = 'ESTAGIARIO',
  AUTONOMO = 'AUTONOMO',
  PJ = 'PJ'
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  VACATION = 'VACATION',
  LEAVE = 'LEAVE',
  TERMINATED = 'TERMINATED'
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  CLOSED = 'CLOSED',
  PAID = 'PAID'
}

export interface Employee {
  _id?: string;
  company_id: string | any;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  type: EmployeeType;
  role: string;
  department?: string;
  admission_date: string | Date;
  base_salary: number;
  dependents_count?: number;
  status: EmployeeStatus;
  bank_info?: {
    bank_name?: string;
    agency?: string;
    account?: string;
    pix_key?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface PayrollItem {
  employee_id: string | any;
  employee_name: string;
  type: EmployeeType;
  gross_salary: number;
  inss_deduction: number;
  irrf_deduction: number;
  other_deductions: number;
  other_additions: number;
  net_salary: number;
  fgts_amount: number;
}

export interface Payroll {
  _id?: string;
  company_id: string | any;
  competence: string; // MM/YYYY
  status: PayrollStatus;
  total_gross: number;
  total_inss: number;
  total_irrf: number;
  total_fgts: number;
  total_net: number;
  employees_count: number;
  items: PayrollItem[];
  created_at?: string;
  updated_at?: string;
}

export interface Payslip {
  _id?: string;
  company_id: string | any;
  employee_id: string | any;
  payroll_id: string | any;
  competence: string;
  emission_date: string | Date;
  earnings: Array<{ description: string; reference?: string; value: number }>;
  deductions: Array<{ description: string; reference?: string; value: number }>;
  total_earnings: number;
  total_deductions: number;
  net_amount: number;
  base_inss: number;
  base_fgts: number;
  fgts_month: number;
  base_irrf: number;
  status: 'PENDING' | 'SENT' | 'DOWNLOADED';
  created_at?: string;
}
