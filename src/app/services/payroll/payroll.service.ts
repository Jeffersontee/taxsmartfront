import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { Employee, Payroll, Payslip } from '../../models/payroll.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  // Signals de Estado
  employees = signal<Employee[]>([]);
  payrolls = signal<Payroll[]>([]);
  payslips = signal<Payslip[]>([]);
  selectedPayroll = signal<Payroll | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Computeds reativos
  totalEmployees = computed(() => this.employees().length);
  activeEmployees = computed(() => this.employees().filter((e) => e.status === 'ACTIVE').length);
  proLaboreCount = computed(() => this.employees().filter((e) => e.type === 'PRO_LABORE').length);
  cltCount = computed(() => this.employees().filter((e) => e.type === 'CLT').length);

  /**
   * Busca colaboradores por empresa
   */
  getEmployees(companyId?: string, type?: string): Observable<ApiResponse<Employee[]>> {
    this.isLoading.set(true);
    let params: any = {};
    if (companyId) params.company_id = companyId;
    if (type) params.type = type;

    return this.http.get<ApiResponse<Employee[]>>(`${this.baseUrl}${Strings.API_PAYROLL_EMPLOYEES}`, { params }).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.employees.set(res.data);
        }
      }),
      catchError((err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erro ao carregar colaboradores');
        return throwError(() => err);
      })
    );
  }

  /**
   * Cria ou atualiza um colaborador
   */
  saveEmployee(employeeData: Partial<Employee>): Observable<ApiResponse<Employee>> {
    this.isLoading.set(true);
    return this.http.post<ApiResponse<Employee>>(`${this.baseUrl}${Strings.API_PAYROLL_EMPLOYEES}`, employeeData).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.employees.update((list) => [res.data, ...list.filter((e) => e._id !== res.data._id)]);
        }
      }),
      catchError((err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erro ao salvar colaborador');
        return throwError(() => err);
      })
    );
  }

  /**
   * Calcula a folha de pagamento de uma competência
   */
  calculatePayroll(payload: { company_id: string; competence: string }): Observable<ApiResponse<Payroll>> {
    this.isLoading.set(true);
    return this.http.post<ApiResponse<Payroll>>(`${this.baseUrl}${Strings.API_PAYROLL_CALCULATE}`, payload).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.selectedPayroll.set(res.data);
          this.payrolls.update((list) => [res.data, ...list.filter((p) => p._id !== res.data._id)]);
        }
      }),
      catchError((err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erro ao calcular folha de pagamento');
        return throwError(() => err);
      })
    );
  }

  /**
   * Lista folhas calculadas
   */
  getPayrolls(companyId?: string): Observable<ApiResponse<Payroll[]>> {
    this.isLoading.set(true);
    let params: any = {};
    if (companyId) params.company_id = companyId;

    return this.http.get<ApiResponse<Payroll[]>>(`${this.baseUrl}${Strings.API_PAYROLL_PAYROLLS}`, { params }).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.payrolls.set(res.data);
        }
      }),
      catchError((err) => {
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Lista holerites emitidos
   */
  getPayslips(companyId?: string, competence?: string): Observable<ApiResponse<Payslip[]>> {
    this.isLoading.set(true);
    let params: any = {};
    if (companyId) params.company_id = companyId;
    if (competence) params.competence = competence;

    return this.http.get<ApiResponse<Payslip[]>>(`${this.baseUrl}${Strings.API_PAYROLL_PAYSLIPS}`, { params }).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.payslips.set(res.data);
        }
      }),
      catchError((err) => {
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }
}
