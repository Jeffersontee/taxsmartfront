import { Component, OnInit, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonButtons,
  IonSearchbar,
  IonTextarea,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  folderOpenOutline,
  cloudUploadOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  warningOutline,
  closeCircleOutline,
  lockClosedOutline,
  eyeOutline,
  trashOutline,
  filterOutline,
  closeOutline,
  businessOutline,
  calendarOutline,
  documentOutline,
  timeOutline,
  downloadOutline,
  checkboxOutline,
  squareOutline,
  addOutline,
  searchOutline,
  attachOutline,
  refreshOutline,
  layersOutline,
} from 'ionicons/icons';
import { DocumentService, IDocumentItem } from '../../../services/document/document.service';
import { CompanyService } from '../../../services/company/company.service';
import { TaskService } from '../../../services/task/task.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UserRole, SystemModule } from '../../../models/user.model';
import { ITask } from '../../../models/task.model';
import { environment } from '../../../../environments/environment';
import { Strings } from '../../../enum/strings';

@Component({
  selector: 'app-admin-documents',
  templateUrl: './admin-documents.component.html',
  styleUrls: ['./admin-documents.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonSpinner,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonButtons,
    IonSearchbar,
    IonTextarea,
  ],
})
export class AdminDocumentsComponent implements OnInit {
  documentService = inject(DocumentService);
  companyService = inject(CompanyService);
  taskService = inject(TaskService);
  authService = inject(AuthService);
  private toastCtrl = inject(ToastController);

  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  companies = this.companyService.companies;
  tasks = this.taskService.tasks;
  documents = this.documentService.documents;
  isLoading = this.documentService.isLoading;
  isUploading = this.documentService.isUploading;

  // Filtros da Barra Superior (Estilo Gestta)
  selectedCompanyId = signal<string>('');
  selectedTaskId = signal<string>('');
  selectedCompetence = signal<string>('10/2026');
  useCompetenceFilter = signal<boolean>(true);
  startDate = signal<string>('');
  endDate = signal<string>('');
  selectedDocType = signal<string>('');
  selectedDepartment = signal<string>('');
  searchTerm = signal<string>('');
  selectedStage = signal<string>('');

  // Seleção Múltipla para Download em Lote
  selectedDocIds = signal<Set<string>>(new Set<string>());

  // Toggle do Card de Upload / Novo Documento
  isUploadCardOpen = signal<boolean>(false);
  allowLooseDocumentUpload = signal<boolean>(true);

  // Upload
  uploadCompanyId = signal<string>('');
  uploadAttachedTo = signal<'Tarefa' | 'Avulso'>('Tarefa');
  uploadTaskId = signal<string>('');
  selectedFile = signal<File | null>(null);
  uploadModule = signal<string>('FISCAL');
  uploadDocType = signal<string>('NFE_XML');
  isDragging = signal<boolean>(false);

  // Modal de Impedimento
  isImpedimentModalOpen = signal<boolean>(false);
  impedimentDocId = signal<string | null>(null);
  impedimentReason = signal<string>('');

  competencesList = ['10/2026', '09/2026', '08/2026', '07/2026', '06/2026'];

  departmentsList = [
    { value: '', label: 'Departamento' },
    { value: 'FISCAL', label: 'Fiscal' },
    { value: 'CONTABIL', label: 'Contábil' },
    { value: 'FOLHA', label: 'Folha / DP' },
    { value: 'LEGALIZACAO', label: 'Legalização' },
    { value: 'RH', label: 'Recursos Humanos' },
  ];

  modulesList = [
    { value: 'FISCAL', label: 'Fiscal (NF-e, NFS-e, Guias)' },
    { value: 'CONTABIL', label: 'Contábil (OFX, Extratos, Despesas)' },
    { value: 'DP', label: 'DP (Ponto, Encargos, Holerites)' },
    { value: 'RH', label: 'RH (Admissões, Férias, Rescisões, ASO)' },
  ];

  documentTypesList = [
    { value: '', label: 'Tipo de documento' },
    { value: 'NFTS-e RELATORIO NOTA FISCAL DE SERVICOS ELETRONICOS DE SP', label: 'NFTS-e RELATORIO NOTA FISCAL DE SERVICOS ELETRONICOS DE SP' },
    { value: 'Relatório Unecont', label: 'Relatório Unecont' },
    { value: 'Recibo de Folha Adiantamento - TOTVS', label: 'Recibo de Folha Adiantamento - TOTVS' },
    { value: 'Extrato Folha Mensal Adiantamento - TOTVS', label: 'Extrato Folha Mensal Adiantamento - TOTVS' },
    { value: 'ARQUIVO SPED FISCAL EFD ICMS IPI', label: 'ARQUIVO SPED FISCAL EFD ICMS IPI' },
    { value: 'APURAÇÃO DE ICMS', label: 'APURAÇÃO DE ICMS' },
    { value: 'DARE 146-5', label: 'DARE 146-5' },
    { value: 'NFE_XML', label: 'NF-e XML de Entrada / Saída' },
    { value: 'OFX', label: 'Extrato Bancário OFX' },
    { value: 'GUIA_DAS', label: 'Guia DAS Simples Nacional' },
    { value: 'HOLERITE', label: 'Holerite / Recibo de Pró-labore' },
    { value: 'CONTRATO_SOCIAL', label: 'Contrato Social' },
  ];

  accessibleModules = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return this.modulesList;
    if (this.authService.isSuperAdmin() || user.role === UserRole.ACCOUNTANT) {
      return this.modulesList;
    }
    if (user.role === UserRole.FISCAL_ANALYST) {
      return this.modulesList.filter((m) => m.value === 'FISCAL' || m.value === 'CONTABIL');
    }
    if (user.role === UserRole.PAYROLL_ANALYST) {
      return this.modulesList.filter((m) => m.value === 'DP' || m.value === 'RH');
    }
    if (user.allowedModules && user.allowedModules.length > 0) {
      const allowed = user.allowedModules as string[];
      return this.modulesList.filter((m) => {
        if (m.value === 'FISCAL' && allowed.includes(SystemModule.FISCAL)) return true;
        if (m.value === 'CONTABIL' && allowed.includes(SystemModule.ACCOUNTING)) return true;
        if (m.value === 'DP' && allowed.includes(SystemModule.PAYROLL)) return true;
        if (m.value === 'RH' && (allowed.includes(SystemModule.PAYROLL) || (allowed as any).includes('RH'))) return true;
        return false;
      });
    }
    return this.modulesList;
  });

  stagesList = [
    { value: 'ENVIADO', label: 'Enviado', color: 'warning' },
    { value: 'EM_ANALISE', label: 'Em Análise', color: 'primary' },
    { value: 'IMPEDIMENTO', label: 'Impedimento', color: 'danger' },
    { value: 'APROVADO', label: 'Aprovado', color: 'success' },
    { value: 'PROCESSADO', label: 'Processado', color: 'tertiary' },
    { value: 'FECHADO', label: 'Fechado', color: 'dark' },
  ];

  filteredDocuments = computed(() => {
    let list = this.documents();
    const term = this.searchTerm().toLowerCase().trim();
    const taskFilter = this.selectedTaskId();
    const docTypeFilter = this.selectedDocType();
    const deptFilter = this.selectedDepartment();

    if (taskFilter) {
      list = list.filter((d) => {
        const docTaskId = typeof d.taskId === 'object' && d.taskId !== null ? (d.taskId as any)._id : d.taskId;
        return String(docTaskId) === String(taskFilter);
      });
    }

    if (docTypeFilter) {
      list = list.filter((d) => (d.documentType || '').toLowerCase() === docTypeFilter.toLowerCase());
    }

    if (deptFilter) {
      list = list.filter((d) => (d.module || '').toUpperCase() === deptFilter.toUpperCase());
    }

    if (term) {
      list = list.filter(
        (d) =>
          d.originalFilename.toLowerCase().includes(term) ||
          (d.documentType || '').toLowerCase().includes(term) ||
          (d.taskTitle || '').toLowerCase().includes(term) ||
          (d.companyName || '').toLowerCase().includes(term) ||
          (d.uploadedBy?.userName || '').toLowerCase().includes(term)
      );
    }

    return list;
  });

  isAllSelected = computed(() => {
    const visible = this.filteredDocuments();
    if (visible.length === 0) return false;
    const selected = this.selectedDocIds();
    return visible.every((d) => selected.has(d._id));
  });

  selectedCount = computed(() => this.selectedDocIds().size);

  isCurrentCompetenceClosed = computed(() => {
    const list = this.documents();
    return list.some((d) => d.isCompetenceClosed);
  });

  // Lista de tarefas disponíveis para a empresa selecionada
  availableTasks = computed(() => {
    const all = this.tasks();
    const cId = this.selectedCompanyId();
    if (!cId) return all;
    return all.filter((t) => {
      const compId = typeof t.companyId === 'object' && t.companyId !== null ? (t.companyId as any)._id : t.companyId;
      return String(compId) === String(cId);
    });
  });

  constructor() {
    addIcons({
      folderOpenOutline,
      cloudUploadOutline,
      documentTextOutline,
      checkmarkCircleOutline,
      warningOutline,
      closeCircleOutline,
      lockClosedOutline,
      eyeOutline,
      trashOutline,
      filterOutline,
      closeOutline,
      businessOutline,
      calendarOutline,
      documentOutline,
      timeOutline,
      downloadOutline,
      checkboxOutline,
      squareOutline,
      addOutline,
      searchOutline,
      attachOutline,
      refreshOutline,
      layersOutline,
    });

    effect(() => {
      const available = this.accessibleModules();
      if (available.length > 0 && !available.some((m) => m.value === this.uploadModule())) {
        untracked(() => {
          this.uploadModule.set(available[0].value);
        });
      }
    });
  }

  ngOnInit(): void {
    this.loadPolicySettings();
    this.companyService.loadCompanies().subscribe({
      next: (res) => {
        if (!this.selectedCompanyId() && res?.data && res.data.length === 1) {
          this.selectedCompanyId.set(res.data[0]._id);
          this.uploadCompanyId.set(res.data[0]._id);
        } else if (this.selectedCompanyId()) {
          this.uploadCompanyId.set(this.selectedCompanyId());
        }
        this.loadTasksForCompany();
        this.loadDocs();
      },
    });
  }

  loadPolicySettings(): void {
    const comp = this.companyService.selectedCompany();
    if (comp && comp.allowLooseDocumentUpload !== undefined) {
      this.allowLooseDocumentUpload.set(comp.allowLooseDocumentUpload);
      if (this.authService.isCompany() && !comp.allowLooseDocumentUpload) {
        this.uploadAttachedTo.set('Tarefa');
      }
      return;
    }

    this.documentService.getSettings().subscribe({
      next: (res) => {
        if (res?.data && res.data.allowLooseDocumentUpload !== undefined) {
          this.allowLooseDocumentUpload.set(res.data.allowLooseDocumentUpload);
          if (this.authService.isCompany() && !res.data.allowLooseDocumentUpload) {
            this.uploadAttachedTo.set('Tarefa');
          }
        }
      },
      error: () => {
        // Fallback para política individual da empresa
      },
    });
  }

  loadTasksForCompany(): void {
    this.taskService
      .loadTasks({
        companyId: this.selectedCompanyId() || undefined,
        competence: this.useCompetenceFilter() ? this.selectedCompetence() : undefined,
      })
      .subscribe();
  }

  loadDocs(): void {
    this.documentService
      .loadDocuments({
        companyId: this.selectedCompanyId() || undefined,
        competence: this.useCompetenceFilter() ? this.selectedCompetence() : undefined,
        module: this.selectedDepartment() || undefined,
        stage: this.selectedStage() || undefined,
        documentType: this.selectedDocType() || undefined,
        taskId: this.selectedTaskId() || undefined,
        startDate: this.startDate() || undefined,
        endDate: this.endDate() || undefined,
      })
      .subscribe();
  }

  onCompanyFilterChange(cId: string): void {
    this.selectedCompanyId.set(cId);
    this.selectedTaskId.set('');
    this.uploadCompanyId.set(cId);
    this.selectedDocIds.set(new Set<string>());
    this.loadTasksForCompany();
    this.loadDocs();
  }

  clearCompanyFilter(): void {
    this.selectedCompanyId.set('');
    this.selectedTaskId.set('');
    this.uploadCompanyId.set('');
    this.selectedDocIds.set(new Set<string>());
    this.loadTasksForCompany();
    this.loadDocs();
  }

  onFilterChange(): void {
    this.selectedDocIds.set(new Set<string>());
    this.loadDocs();
  }

  toggleSelectAll(): void {
    const current = new Set(this.selectedDocIds());
    const visible = this.filteredDocuments();
    if (this.isAllSelected()) {
      visible.forEach((d) => current.delete(d._id));
    } else {
      visible.forEach((d) => current.add(d._id));
    }
    this.selectedDocIds.set(current);
  }

  toggleSelectDoc(docId: string): void {
    const current = new Set(this.selectedDocIds());
    if (current.has(docId)) {
      current.delete(docId);
    } else {
      current.add(docId);
    }
    this.selectedDocIds.set(current);
  }

  isDocSelected(docId: string): boolean {
    return this.selectedDocIds().has(docId);
  }

  downloadSelected(): void {
    const ids = this.selectedDocIds();
    if (ids.size === 0) return;
    const docs = this.filteredDocuments().filter((d) => ids.has(d._id));
    for (const doc of docs) {
      const url = this.getDownloadUrl(doc);
      window.open(url, '_blank');
    }
  }

  getFileUrl(doc: IDocumentItem | any): string {
    if (!doc) return '#';
    if (typeof doc === 'string') {
      return doc;
    }
    return this.documentService.getFileViewUrl(doc._id);
  }

  getDownloadUrl(doc: IDocumentItem | any): string {
    if (!doc) return '#';
    if (typeof doc === 'string') {
      return doc;
    }
    return this.documentService.getFileDownloadUrl(doc._id);
  }

  // Drag & Drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile.set(event.dataTransfer.files[0]);
      if (this.selectedCompanyId() && !this.uploadCompanyId()) {
        this.uploadCompanyId.set(this.selectedCompanyId());
      }
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile.set(files[0]);
      if (this.selectedCompanyId() && !this.uploadCompanyId()) {
        this.uploadCompanyId.set(this.selectedCompanyId());
      }
    }
  }

  submitUpload(): void {
    const file = this.selectedFile();
    if (!file) return;

    const targetCompId = this.uploadCompanyId() || this.selectedCompanyId();
    if (!targetCompId) {
      this.toastCtrl
        .create({
          message: 'Por favor, selecione para qual Empresa o arquivo será direcionado.',
          duration: 3500,
          color: 'warning',
          position: 'top',
        })
        .then((t) => t.present());
      return;
    }

    if (this.authService.isCompany() && !this.allowLooseDocumentUpload()) {
      if (this.uploadAttachedTo() === 'Avulso' || !this.uploadTaskId()) {
        this.toastCtrl
          .create({
            message: 'O envio de documentos avulsos foi desativado pelo escritório contábil. Todo documento deve ser vinculado a uma Tarefa da Linha do Tempo.',
            duration: 4500,
            color: 'warning',
            position: 'top',
          })
          .then((t) => t.present());
        return;
      }
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', targetCompId);
    formData.append('competence', this.selectedCompetence());
    formData.append('module', this.uploadModule());
    formData.append('documentType', this.uploadDocType());

    if (this.uploadAttachedTo() === 'Tarefa' && this.uploadTaskId()) {
      formData.append('taskId', this.uploadTaskId());
    }

    this.documentService.uploadDocument(formData).subscribe({
      next: () => {
        this.toastCtrl
          .create({
            message: `Arquivo '${file.name}' enviado com sucesso e integrado ao sistema!`,
            duration: 3000,
            color: 'success',
            position: 'top',
          })
          .then((t) => t.present());

        this.selectedFile.set(null);
        this.isUploadCardOpen.set(false);
        this.loadDocs();
      },
      error: (err) => {
        this.toastCtrl
          .create({
            message: err.error?.error?.message || 'Falha ao enviar arquivo.',
            duration: 4000,
            color: 'danger',
            position: 'top',
          })
          .then((t) => t.present());
      },
    });
  }

  changeStage(doc: IDocumentItem, stage: string): void {
    if (stage === 'IMPEDIMENTO') {
      this.impedimentDocId.set(doc._id);
      this.impedimentReason.set('');
      this.isImpedimentModalOpen.set(true);
      return;
    }

    this.documentService.updateStage(doc._id, stage).subscribe({
      next: () => {
        this.toastCtrl
          .create({
            message: `Estágio alterado para '${stage}' com sucesso.`,
            duration: 2500,
            color: 'success',
            position: 'top',
          })
          .then((t) => t.present());
      },
    });
  }

  confirmImpediment(): void {
    const docId = this.impedimentDocId();
    const reason = this.impedimentReason().trim();
    if (!docId || !reason) return;

    this.documentService.updateStage(docId, 'IMPEDIMENTO', reason).subscribe({
      next: () => {
        this.closeImpedimentModal();
        this.toastCtrl
          .create({
            message: 'Impedimento registrado e cliente notificado com sucesso.',
            duration: 3000,
            color: 'warning',
            position: 'top',
          })
          .then((t) => t.present());
      },
    });
  }

  closeImpedimentModal(): void {
    this.isImpedimentModalOpen.set(false);
    this.impedimentDocId.set(null);
    this.impedimentReason.set('');
  }

  deleteDoc(doc: IDocumentItem): void {
    if (!confirm(`Deseja realmente excluir o documento '${doc.originalFilename}'?`)) return;

    this.documentService.deleteDocument(doc._id).subscribe({
      next: () => {
        this.toastCtrl
          .create({
            message: 'Documento excluído com sucesso.',
            duration: 2500,
            color: 'success',
            position: 'top',
          })
          .then((t) => t.present());
      },
    });
  }

  closeCompetence(): void {
    const cId = this.selectedCompanyId();
    if (!cId) return;

    if (!confirm(`Deseja formalmente encerrar a competência ${this.selectedCompetence()}?`)) return;

    this.documentService.closeCompetence(cId, this.selectedCompetence(), this.selectedDepartment() || 'FISCAL').subscribe({
      next: (res) => {
        this.toastCtrl
          .create({
            message: `Competência ${this.selectedCompetence()} encerrada. ${res.data?.documentsClosed || 0} documentos fechados.`,
            duration: 3500,
            color: 'dark',
            position: 'top',
          })
          .then((t) => t.present());
        this.loadDocs();
      },
    });
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getStageBadge(stage: string): { label: string; color: string } {
    return this.stagesList.find((s) => s.value === stage) || { label: stage, color: 'medium' };
  }
}
