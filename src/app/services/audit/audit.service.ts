import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { ApiResponse } from '../../models/user.model';

export interface IAuditLogItem {
  _id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  companyId?: string;
  companyCnpj?: string;
  module: string;
  action: string;
  severity: 'info' | 'warn' | 'error' | 'critical';
  description?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  httpMethod?: string;
  statusCode?: number;
  createdAt: string;
}

export interface IAuditSummary {
  totalLogs: number;
  criticalLast24h: number;
  bySeverity: Record<string, number>;
  topActions: { action: string; count: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class AuditFrontService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  logs = signal<IAuditLogItem[]>([]);
  totalLogs = signal<number>(0);
  summary = signal<IAuditSummary | null>(null);
  isLoading = signal<boolean>(false);

  /**
   * Busca registros de auditoria com filtros
   */
  loadLogs(filters: {
    companyId?: string;
    module?: string;
    severity?: string;
    action?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Observable<ApiResponse<{ logs: IAuditLogItem[]; total: number }>> {
    this.isLoading.set(true);
    let params = new HttpParams();

    if (filters.companyId) params = params.set('companyId', filters.companyId);
    if (filters.module) params = params.set('module', filters.module);
    if (filters.severity) params = params.set('severity', filters.severity);
    if (filters.action) params = params.set('action', filters.action);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.limit) params = params.set('limit', String(filters.limit));

    const url = `${this.baseUrl}${Strings.API_AUDIT_LOGS}`;

    return this.http.get<ApiResponse<{ logs: IAuditLogItem[]; total: number }>>(url, { params }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.logs.set(response.data.logs || []);
          this.totalLogs.set(response.data.total || 0);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Busca métricas executivas de auditoria
   */
  loadSummary(): Observable<ApiResponse<IAuditSummary>> {
    const url = `${this.baseUrl}${Strings.API_AUDIT_SUMMARY}`;
    return this.http.get<ApiResponse<IAuditSummary>>(url).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.summary.set(response.data);
        }
      })
    );
  }
}
