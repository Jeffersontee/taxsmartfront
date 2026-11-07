import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { ApiResponse } from '../../models/user.model';

export interface IDocumentItem {
  _id: string;
  companyId: string;
  companyName?: string;
  competence: string;
  module: 'FISCAL' | 'CONTABIL' | 'DP' | 'RH' | 'GERAL';
  documentType: string;
  stage: 'ENVIADO' | 'EM_ANALISE' | 'IMPEDIMENTO' | 'APROVADO' | 'PROCESSADO' | 'FECHADO';
  taskId?: string | { _id: string; title: string; dueDate?: string; status?: string; category?: string; competence?: string };
  taskTitle?: string;
  taskDocumentId?: string;
  attachedTo?: 'Tarefa' | 'Cobrança' | 'Avulso';
  dueMetaDate?: string;
  originalFilename: string;
  safeFilename: string;
  fileUrl: string;
  provider: string;
  fileSizeBytes: number;
  mimeType: string;
  hashSha256?: string;
  impedimentReason?: string;
  uploadedBy: {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
  };
  isCompetenceClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  severity: string;
  description?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  httpMethod?: string;
  statusCode?: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  documents = signal<IDocumentItem[]>([]);
  totalDocuments = signal<number>(0);
  isLoading = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  allowLooseDocumentUpload = signal<boolean>(true);

  /**
   * Busca documentos com filtros de esteira e central de busca integrada
   */
  loadDocuments(filters: {
    companyId?: string;
    competence?: string;
    module?: string;
    stage?: string;
    documentType?: string;
    taskId?: string;
    attachedTo?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    department?: string;
    page?: number;
    limit?: number;
  }): Observable<ApiResponse<{ documents: IDocumentItem[]; total: number }>> {
    this.isLoading.set(true);
    let params = new HttpParams();

    if (filters.companyId) params = params.set('companyId', filters.companyId);
    if (filters.competence) params = params.set('competence', filters.competence);
    if (filters.module) params = params.set('module', filters.module);
    if (filters.stage) params = params.set('stage', filters.stage);
    if (filters.documentType) params = params.set('documentType', filters.documentType);
    if (filters.taskId) params = params.set('taskId', filters.taskId);
    if (filters.attachedTo) params = params.set('attachedTo', filters.attachedTo);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.department) params = params.set('department', filters.department);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.limit) params = params.set('limit', String(filters.limit));

    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}`;

    return this.http.get<ApiResponse<{ documents: IDocumentItem[]; total: number }>>(url, { params }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.documents.set(response.data.documents || []);
          this.totalDocuments.set(response.data.total || 0);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Envia um arquivo para a esteira contábil
   */
  uploadDocument(formData: FormData): Observable<ApiResponse<IDocumentItem>> {
    this.isUploading.set(true);
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS_UPLOAD}`;

    return this.http.post<ApiResponse<IDocumentItem>>(url, formData).pipe(
      tap((response) => {
        this.isUploading.set(false);
        const newDoc = response.data;
        if (response.success && newDoc) {
          this.documents.update((list) => [newDoc, ...list]);
          this.totalDocuments.update((count) => count + 1);
        }
      }),
      catchError((error) => {
        this.isUploading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Atualiza o estágio do processo (Análise, Impedimento, Aprovação, Fechamento)
   */
  updateStage(
    documentId: string,
    stage: string,
    impedimentReason?: string
  ): Observable<ApiResponse<IDocumentItem>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/${documentId}/stage`;

    return this.http.patch<ApiResponse<IDocumentItem>>(url, { stage, impedimentReason }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        const updatedDoc = response.data;
        if (response.success && updatedDoc) {
          this.documents.update((list) =>
            list.map((doc) => (doc._id === documentId ? updatedDoc : doc))
          );
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Exclui um documento
   */
  deleteDocument(documentId: string): Observable<ApiResponse<void>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/${documentId}`;

    return this.http.delete<ApiResponse<void>>(url).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.documents.update((list) => list.filter((doc) => doc._id !== documentId));
          this.totalDocuments.update((count) => Math.max(0, count - 1));
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Encerra e bloqueia a competência formalmente
   */
  closeCompetence(companyId: string, competence: string, module: string): Observable<ApiResponse<{ documentsClosed: number }>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/close-competence`;

    return this.http.post<ApiResponse<{ documentsClosed: number }>>(url, { companyId, competence, module }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.documents.update((list) =>
            list.map((doc) =>
              doc.companyId === companyId && doc.competence === competence && doc.module === module
                ? { ...doc, isCompetenceClosed: true, stage: 'FECHADO' }
                : doc
            )
          );
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra a auditoria de visualização/leitura do documento em tela
   */
  logDocumentView(documentId: string): Observable<ApiResponse<{ documentId: string; viewedAt: string }>> {
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/${documentId}/view`;
    return this.http.post<ApiResponse<{ documentId: string; viewedAt: string }>>(url, {});
  }

  /**
   * Registra a auditoria de download do documento
   */
  logDocumentDownload(documentId: string): Observable<ApiResponse<{ documentId: string; downloadedAt: string }>> {
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/${documentId}/download`;
    return this.http.post<ApiResponse<{ documentId: string; downloadedAt: string }>>(url, {});
  }

  /**
   * Obtém o histórico completo de auditoria do documento
   */
  getDocumentAuditHistory(documentId: string): Observable<ApiResponse<IAuditLogItem[]>> {
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/${documentId}/audit`;
    return this.http.get<ApiResponse<IAuditLogItem[]>>(url);
  }

  /**
   * Obtém status e configurações dos provedores de armazenamento
   */
  getStorageStatus(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/storage/status`;
    return this.http.get<ApiResponse<any>>(url);
  }

  /**
   * Testa conectividade com o Cloudinary
   */
  testCloudinaryConnection(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/storage/test-cloudinary`;
    return this.http.post<ApiResponse<any>>(url, {});
  }

  /**
   * Altera o provedor de storage ativo
   */
  setActiveStorageProvider(provider: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/storage/set-active`;
    return this.http.post<ApiResponse<any>>(url, { provider });
  }

  /**
   * Obtém o conteúdo cru/texto de um documento (XML, OFX, etc.)
   */
  getDocumentRawContent(documentId: string): Observable<ApiResponse<{ filename: string; mimeType: string; content: string }>> {
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/${documentId}/raw`;
    return this.http.get<ApiResponse<{ filename: string; mimeType: string; content: string }>>(url);
  }

  /**
   * Obtém as configurações globais de armazenamento e políticas de envio
   */
  getSettings(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/settings`;
    return this.http.get<ApiResponse<any>>(url).pipe(
      tap((res) => {
        if (res.data && res.data.allowLooseDocumentUpload !== undefined) {
          this.allowLooseDocumentUpload.set(res.data.allowLooseDocumentUpload);
        }
      })
    );
  }

  /**
   * Atualiza as configurações de envio e storage (Super Admin)
   */
  updateSettings(data: { allowLooseDocumentUpload?: boolean; activeStorageProvider?: string }): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}${Strings.API_DOCUMENTS}/settings`;
    return this.http.patch<ApiResponse<any>>(url, data).pipe(
      tap((res) => {
        if (res.data && res.data.allowLooseDocumentUpload !== undefined) {
          this.allowLooseDocumentUpload.set(res.data.allowLooseDocumentUpload);
        }
      })
    );
  }

  /**
   * Gera URL segura para streaming/visualização inline de PDF ou arquivo
   */
  getFileViewUrl(documentId: string): string {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    return `${this.baseUrl}${Strings.API_DOCUMENTS}/${documentId}/view?token=${encodeURIComponent(token)}`;
  }

  /**
   * Gera URL segura para download direto
   */
  getFileDownloadUrl(documentId: string): string {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    return `${this.baseUrl}${Strings.API_DOCUMENTS}/${documentId}/download?download=true&token=${encodeURIComponent(token)}`;
  }
}
