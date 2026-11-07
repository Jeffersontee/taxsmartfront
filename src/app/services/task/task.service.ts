import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { ITask, ITaskTemplate, ITimelineSummary, TaskStatus } from '../../models/task.model';
import { ApiResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  // Signals de estado
  tasks = signal<ITask[]>([]);
  templates = signal<ITaskTemplate[]>([]);
  selectedTask = signal<ITask | null>(null);
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
          // Se houver uma tarefa selecionada, atualizá-la
          const current = this.selectedTask();
          if (current) {
            const updated = response.data.find((t) => t._id === current._id);
            if (updated) this.selectedTask.set(updated);
          }
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Busca templates de tarefas disponíveis
   */
  loadTemplates(category?: string): Observable<ApiResponse<ITaskTemplate[]>> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);

    const url = `${this.baseUrl}${Strings.API_TASKS_TEMPLATES}`;
    return this.http.get<ApiResponse<ITaskTemplate[]>>(url, { params }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.templates.set(response.data);
        }
      })
    );
  }

  /**
   * Cria uma nova tarefa (livre ou a partir de template)
   */
  createTask(taskData: Partial<ITask>): Observable<ApiResponse<ITask>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}`;
    return this.http.post<ApiResponse<ITask>>(url, taskData).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.tasks.update((items) => [response.data!, ...items]);
        }
      })
    );
  }

  /**
   * Obtém detalhes completos de uma tarefa
   */
  getById(taskId: string): Observable<ApiResponse<ITask>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}`;
    return this.http.get<ApiResponse<ITask>>(url).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.selectedTask.set(response.data);
        }
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
          if (this.selectedTask()?._id === taskId) {
            this.selectedTask.set(response.data);
          }
        }
      })
    );
  }

  updateTaskStatus(taskId: string, status: TaskStatus, reason?: string): Observable<ApiResponse<ITask>> {
    return this.updateStatus(taskId, status, reason);
  }

  /**
   * Alterna estado de conclusão de um item do Checklist
   */
  toggleChecklist(taskId: string, checklistId: string, completed?: boolean): Observable<ApiResponse<ITask>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}/checklist/${checklistId}`;
    return this.http.patch<ApiResponse<ITask>>(url, { completed }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.tasks.update((items) =>
            items.map((t) => (t._id === taskId ? response.data! : t))
          );
          if (this.selectedTask()?._id === taskId) {
            this.selectedTask.set(response.data);
          }
        }
      })
    );
  }

  /**
   * Adiciona novo item ao checklist da tarefa
   */
  addChecklistItem(taskId: string, title: string): Observable<ApiResponse<ITask>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}/checklist`;
    return this.http.post<ApiResponse<ITask>>(url, { title }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.tasks.update((items) =>
            items.map((t) => (t._id === taskId ? response.data! : t))
          );
          if (this.selectedTask()?._id === taskId) {
            this.selectedTask.set(response.data);
          }
        }
      })
    );
  }

  /**
   * Anexa arquivo ou vínculo a um documento solicitado
   */
  attachRequiredDocument(
    taskId: string,
    docId: string,
    payload: { documentId?: string; fileUrl?: string; originalFilename?: string }
  ): Observable<ApiResponse<ITask>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}/required-documents/${docId}/attach`;
    return this.http.post<ApiResponse<ITask>>(url, payload).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.tasks.update((items) =>
            items.map((t) => (t._id === taskId ? response.data! : t))
          );
          if (this.selectedTask()?._id === taskId) {
            this.selectedTask.set(response.data);
          }
        }
      })
    );
  }

  /**
   * Desconsidera requisito de documento com justificativa
   */
  disregardRequiredDocument(taskId: string, docId: string, reason: string): Observable<ApiResponse<ITask>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}/required-documents/${docId}/disregard`;
    return this.http.patch<ApiResponse<ITask>>(url, { reason }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.tasks.update((items) =>
            items.map((t) => (t._id === taskId ? response.data! : t))
          );
          if (this.selectedTask()?._id === taskId) {
            this.selectedTask.set(response.data);
          }
        }
      })
    );
  }

  /**
   * Adiciona comentário à tarefa
   */
  addComment(taskId: string, message: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}/comments`;
    return this.http.post<ApiResponse<any>>(url, { message }).pipe(
      tap(() => {
        this.getById(taskId).subscribe();
      })
    );
  }

  /**
   * Gera tarefas pré-definidas para uma empresa a partir dos templates do seu regime tributário
   */
  generateTasksForCompany(companyId: string, competence: string): Observable<ApiResponse<{ createdCount: number; existingCount: number; tasks: ITask[] }>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_TASKS_GENERATE}`;
    return this.http.post<ApiResponse<{ createdCount: number; existingCount: number; tasks: ITask[] }>>(url, { companyId, competence }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data?.tasks?.length) {
          this.tasks.update((items) => [...response.data!.tasks, ...items]);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Aponta tempo trabalhado na tarefa
   */
  logTime(taskId: string, seconds: number): Observable<ApiResponse<{ timeSpentSeconds: number }>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}/time`;
    return this.http.patch<ApiResponse<{ timeSpentSeconds: number }>>(url, { seconds }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          const current = this.selectedTask();
          if (current && current._id === taskId) {
            this.selectedTask.set({
              ...current,
              timeSpentSeconds: response.data.timeSpentSeconds,
            });
          }
        }
      })
    );
  }

  /**
   * Obtém usuários cadastrados na empresa vinculada à tarefa (Accordion Usuários de Cliente)
   */
  getClientUsers(taskId: string): Observable<ApiResponse<any[]>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}/client-users`;
    return this.http.get<ApiResponse<any[]>>(url);
  }

  /**
   * Adiciona e-mail com cópia na tarefa (Accordion E-mails Adicionais)
   */
  addAdditionalEmail(taskId: string, email: string): Observable<ApiResponse<ITask>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}/additional-emails`;
    return this.http.post<ApiResponse<ITask>>(url, { email }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.selectedTask.set(res.data);
          this.tasks.update((items) => items.map((t) => (t._id === taskId ? res.data! : t)));
        }
      })
    );
  }

  /**
   * Dispara recobrança de documentos pendentes na tarefa (Botão Recobrar)
   */
  recoverDocuments(taskId: string): Observable<ApiResponse<{ pendingCount: number; task: ITask }>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}/recover-documents`;
    return this.http.post<ApiResponse<{ pendingCount: number; task: ITask }>>(url, {}).pipe(
      tap((res) => {
        if (res.success && res.data?.task) {
          this.selectedTask.set(res.data.task);
          this.tasks.update((items) => items.map((t) => (t._id === taskId ? res.data!.task : t)));
        }
      })
    );
  }

  /**
   * Atualiza dados gerais da tarefa (Valor, Notificações WhatsApp/Email, Responsável)
   */
  updateTask(taskId: string, data: Partial<ITask>): Observable<ApiResponse<ITask>> {
    const url = `${this.baseUrl}${Strings.API_TASKS}/${taskId}`;
    return this.http.patch<ApiResponse<ITask>>(url, data).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.selectedTask.set(res.data);
          this.tasks.update((items) => items.map((t) => (t._id === taskId ? res.data! : t)));
        }
      })
    );
  }
}
