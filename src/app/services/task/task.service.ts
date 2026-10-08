import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { ITask, ITimelineSummary, TaskStatus } from '../../models/task.model';
import { ApiResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  // Signals de estado
  tasks = signal<ITask[]>([]);
  summary = signal<ITimelineSummary | null>(null);
  isLoading = signal<boolean>(false);

  // Signals de Filtros
  selectedCompetence = signal<string>('10/2026');
  selectedStatusFilter = signal<string>('ALL');
  selectedCompanyId = signal<string>('');
  selectedCategory = signal<string>('');

  // Computed de tarefas filtradas
  filteredTasks = computed(() => {
    let list = this.tasks();
    const status = this.selectedStatusFilter();
    const company = this.selectedCompanyId();
    const category = this.selectedCategory();

    if (status && status !== 'ALL') {
      list = list.filter((t) => t.status === status);
    }
    if (company) {
      list = list.filter(
        (t) => t.companyId?._id === company || (typeof t.companyId === 'string' && t.companyId === company)
      );
    }
    if (category) {
      list = list.filter((t) => t.category === category);
    }
    return list;
  });

  /**
   * Busca lista de tarefas com filtros opcionais
   */
  loadTasks(filters?: {
    competence?: string;
    companyId?: string;
    status?: string;
    category?: string;
  }): Observable<ApiResponse<ITask[]>> {
    this.isLoading.set(true);
    let params = new HttpParams();

    const comp = filters?.competence || this.selectedCompetence();
    if (comp) params = params.set('competence', comp);
    if (filters?.companyId || this.selectedCompanyId()) {
      params = params.set('companyId', filters?.companyId || this.selectedCompanyId());
    }
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.category) params = params.set('category', filters.category);

    const url = `${this.baseUrl}${Strings.API_TASKS}`;

    return this.http.get<ApiResponse<ITask[]>>(url, { params }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.tasks.set(response.data);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém resumo numérico da Linha do Tempo
   */
  loadSummary(competence?: string, companyId?: string): Observable<ApiResponse<ITimelineSummary>> {
    let params = new HttpParams();
    const comp = competence || this.selectedCompetence();
    const compId = companyId || this.selectedCompanyId();

    if (comp) params = params.set('competence', comp);
    if (compId) params = params.set('companyId', compId);

    const url = `${this.baseUrl}${Strings.API_TASKS_SUMMARY}`;

    return this.http.get<ApiResponse<ITimelineSummary>>(url, { params }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.summary.set(response.data);
        }
      })
    );
  }

  /**
   * Atualiza status de uma tarefa com motivo opcional
   */
  updateStatus(taskId: string, status: TaskStatus, reason?: string): Observable<ApiResponse<ITask>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}/status`;
    return this.http.patch<ApiResponse<ITask>>(url, { status, reason }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.tasks.update((items) =>
            items.map((t) => (t._id === taskId ? response.data! : t))
          );
        }
      })
    );
  }

  updateTaskStatus(taskId: string, status: TaskStatus, reason?: string): Observable<ApiResponse<ITask>> {
    return this.updateStatus(taskId, status, reason);
  }
}
