import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { ICompany } from '../../models/company.model';
import { ApiResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  // Signals de estado
  companies = signal<ICompany[]>([]);
  selectedCompany = signal<ICompany | null>(null);
  isLoading = signal<boolean>(false);

  /**
   * Busca lista de empresas cadastradas
   */
  loadCompanies(search?: string, taxRegime?: string): Observable<ApiResponse<ICompany[]>> {
    this.isLoading.set(true);
    let params = new HttpParams();

    if (search) params = params.set('search', search);
    if (taxRegime) params = params.set('taxRegime', taxRegime);

    const url = `${this.baseUrl}${Strings.API_COMPANIES}`;

    return this.http.get<ApiResponse<ICompany[]>>(url, { params }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.companies.set(response.data);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Busca lista de empresas cadastradas (alias getCompanies)
   */
  getCompanies(search?: string, taxRegime?: string): Observable<ApiResponse<ICompany[]>> {
    return this.loadCompanies(search, taxRegime);
  }

  /**
   * Cadastra uma nova empresa
   */
  createCompany(companyData: Partial<ICompany>): Observable<ApiResponse<ICompany>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_COMPANIES}`;
    return this.http.post<ApiResponse<ICompany>>(url, companyData).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          const created = response.data;
          this.companies.update((list) => [created, ...list]);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Busca detalhes de uma empresa por ID
   */
  getCompanyById(companyId: string): Observable<ApiResponse<ICompany>> {
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}`;
    return this.http.get<ApiResponse<ICompany>>(url).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.selectedCompany.set(response.data);
        }
      })
    );
  }

  /**
   * Atualiza os dados de uma empresa existente
   */
  updateCompany(companyId: string, companyData: Partial<ICompany>): Observable<ApiResponse<ICompany>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}`;
    return this.http.put<ApiResponse<ICompany>>(url, companyData).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          const updated = response.data;
          this.companies.update((list) => list.map((c) => (c._id === companyId ? updated : c)));
          this.selectedCompany.set(updated);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém tarefas atribuídas e templates disponíveis no sistema para a empresa (Dual Listbox Gestta)
   */
  getCompanyTasks(companyId: string): Observable<ApiResponse<{
    companyId: string;
    companyName: string;
    totalSystem: number;
    totalAvailable: number;
    totalCompany: number;
    systemTasks: any[];
    companyTasks: any[];
  }>> {
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}/tasks`;
    return this.http.get<ApiResponse<any>>(url);
  }

  /**
   * Vincula templates de tarefas à empresa (Adiciona à direita)
   */
  assignTasksToCompany(companyId: string, templateIds: string[], responsibleId?: string, requiresApproval?: boolean): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}/tasks`;
    return this.http.post<ApiResponse<any>>(url, { templateIds, responsibleId, requiresApproval });
  }

  /**
   * Remove tarefas atribuídas à empresa (Remove da direita)
   */
  removeTasksFromCompany(companyId: string, templateIds: string[]): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}/tasks`;
    return this.http.delete<ApiResponse<any>>(url, { body: { templateIds } });
  }

  /**
   * Exclui ou inativa uma empresa
   */
  deleteCompany(companyId: string): Observable<ApiResponse<any>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}`;
    return this.http.delete<ApiResponse<any>>(url).pipe(
      tap(() => {
        this.isLoading.set(false);
        this.companies.update((list) => list.filter((c) => c._id !== companyId));
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Atualiza responsável ou aprovação necessária de uma tarefa do cliente
   */
  updateCompanyTask(companyId: string, templateId: string, data: { responsibleId?: string; requiresApproval?: boolean }): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}/tasks/${templateId}`;
    return this.http.patch<ApiResponse<any>>(url, data);
  }

  /**
   * Copia tarefas de outro cliente para este como modelo (Accordion 1 Gestta)
   */
  copyTasksFromAnotherCompany(companyId: string, sourceCompanyId: string, department?: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}/copy-tasks-from`;
    return this.http.post<ApiResponse<any>>(url, { sourceCompanyId, department });
  }

  /**
   * Copia tarefas deste cliente para múltiplos outros como modelo (Accordion 2 Gestta)
   */
  copyTasksToOtherCompanies(companyId: string, targetCompanyIds: string[], department?: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}/copy-tasks-to`;
    return this.http.post<ApiResponse<any>>(url, { targetCompanyIds, department });
  }

  /**
   * Gera as tarefas na esteira para a competência selecionada
   */
  generateTasksFromAssigned(companyId: string, competence: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}/generate-tasks`;
    return this.http.post<ApiResponse<any>>(url, { competence });
  }
}
