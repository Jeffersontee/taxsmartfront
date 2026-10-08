import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { IInvoice, IInvoiceSummary, ITaxSimulation, ITaxGuide, TaxGuideStatus } from '../../models/fiscal.model';
import { ApiResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FiscalService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  // Signals de Estado
  invoices = signal<IInvoice[]>([]);
  summary = signal<IInvoiceSummary | null>(null);
  simulation = signal<ITaxSimulation | null>(null);
  guides = signal<ITaxGuide[]>([]);
  isLoading = signal<boolean>(false);

  // Filtros Reativos
  selectedCompanyId = signal<string>('');
  selectedCompetence = signal<string>('10/2026');

  /**
   * Carrega lista de Notas Fiscais e o resumo de faturamento
   */
  loadInvoices(filters?: { companyId?: string; competence?: string; operation?: string }): Observable<ApiResponse<{ invoices: IInvoice[]; summary: IInvoiceSummary }>> {
    this.isLoading.set(true);
    let params = new HttpParams();

    const compId = filters?.companyId || this.selectedCompanyId();
    const comp = filters?.competence || this.selectedCompetence();

    if (compId) params = params.set('companyId', compId);
    if (comp) params = params.set('competence', comp);
    if (filters?.operation) params = params.set('operation', filters.operation);

    const url = `${this.baseUrl}${Strings.API_FISCAL_INVOICES}`;

    return this.http.get<ApiResponse<{ invoices: IInvoice[]; summary: IInvoiceSummary }>>(url, { params }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.invoices.set(response.data.invoices);
          this.summary.set(response.data.summary);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Simula apuração de tributos (Simples Nacional / Lucro Presumido)
   */
  simulateCalculation(companyId: string, competence: string): Observable<ApiResponse<ITaxSimulation>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_FISCAL_CALCULATE}`;

    return this.http.post<ApiResponse<ITaxSimulation>>(url, { companyId, competence }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.simulation.set(response.data);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Salva a apuração no banco
   */
  saveCalculation(calculationData: any): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_FISCAL_CALCULATIONS}`;
    return this.http.post<ApiResponse<any>>(url, calculationData);
  }

  /**
   * Carrega guias fiscais geradas
   */
  loadGuides(filters?: { companyId?: string; competence?: string; status?: string }): Observable<ApiResponse<ITaxGuide[]>> {
    this.isLoading.set(true);
    let params = new HttpParams();

    const compId = filters?.companyId || this.selectedCompanyId();
    const comp = filters?.competence || this.selectedCompetence();

    if (compId) params = params.set('companyId', compId);
    if (comp) params = params.set('competence', comp);
    if (filters?.status) params = params.set('status', filters.status);

    const url = `${this.baseUrl}${Strings.API_FISCAL_GUIDES}`;

    return this.http.get<ApiResponse<ITaxGuide[]>>(url, { params }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.guides.set(response.data);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cria nova guia fiscal
   */
  createGuide(guideData: Partial<ITaxGuide>): Observable<ApiResponse<ITaxGuide>> {
    const url = `${this.baseUrl}${Strings.API_FISCAL_GUIDES}`;
    return this.http.post<ApiResponse<ITaxGuide>>(url, guideData).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.guides.update((list) => [response.data!, ...list]);
        }
      })
    );
  }

  /**
   * Atualiza status da guia (ex: marcar como PAGO)
   */
  updateGuideStatus(guideId: string, status: TaxGuideStatus, paidAmount?: number): Observable<ApiResponse<ITaxGuide>> {
    const url = `${this.baseUrl}${Strings.API_FISCAL_GUIDES}/${guideId}/status`;
    return this.http.patch<ApiResponse<ITaxGuide>>(url, { status, paidAmount }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.guides.update((list) => list.map((g) => (g._id === guideId ? response.data! : g)));
        }
      })
    );
  }
}
