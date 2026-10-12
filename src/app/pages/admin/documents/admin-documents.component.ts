import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
} from 'ionicons/icons';
import { DocumentService, IDocumentItem } from '../../../services/document/document.service';
import { CompanyService } from '../../../services/company/company.service';
import { AuthService } from '../../../services/auth/auth.service';

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
  authService = inject(AuthService);
  private toastCtrl = inject(ToastController);

  companies = this.companyService.companies;
  documents = this.documentService.documents;
  isLoading = this.documentService.isLoading;
  isUploading = this.documentService.isUploading;

  // Filtros
  selectedCompanyId = signal<string>('');
  selectedCompetence = signal<string>('10/2026');
  selectedModule = signal<string>('');
  selectedStage = signal<string>('');
  searchTerm = signal<string>('');

  // Upload
  selectedFile = signal<File | null>(null);
  uploadModule = signal<string>('FISCAL');
  uploadDocType = signal<string>('NFE_XML');
  isDragging = signal<boolean>(false);

  // Modal de Impedimento
  isImpedimentModalOpen = signal<boolean>(false);
  impedimentDocId = signal<string | null>(null);
  impedimentReason = signal<string>('');

  competencesList = ['10/2026', '09/2026', '08/2026', '07/2026', '06/2026'];

  modulesList = [
    { value: 'FISCAL', label: 'Fiscal (NF-e, NFS-e, Guias)' },
    { value: 'CONTABIL', label: 'Contábil (OFX, Extratos, Despesas)' },
    { value: 'DP', label: 'DP (Ponto, Encargos, Holerites)' },
    { value: 'RH', label: 'RH (Admissões, Férias, Rescisões, ASO)' },
  ];

  stagesList = [
    { value: 'ENVIADO', label: 'Enviado (Aguardando Análise)', color: 'warning' },
    { value: 'EM_ANALISE', label: 'Em Análise pelo Escritório', color: 'primary' },
    { value: 'IMPEDIMENTO', label: 'Impedimento / Pendência', color: 'danger' },
    { value: 'APROVADO', label: 'Aprovado / Conferido', color: 'success' },
    { value: 'PROCESSADO', label: 'Processado / Lançado', color: 'tertiary' },
    { value: 'FECHADO', label: 'Fechado (Competência Encerrada)', color: 'dark' },
  ];

  filteredDocuments = computed(() => {
    let list = this.documents();
    const term = this.searchTerm().toLowerCase().trim();

    if (term) {
      list = list.filter(
        (d) =>
          d.originalFilename.toLowerCase().includes(term) ||
          d.documentType.toLowerCase().includes(term) ||
          d.uploadedBy.userName.toLowerCase().includes(term)
      );
    }

    return list;
  });

  isCurrentCompetenceClosed = computed(() => {
    const list = this.documents();
    return list.some((d) => d.isCompetenceClosed);
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
    });
  }

  ngOnInit(): void {
    this.companyService.loadCompanies().subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.selectedCompanyId.set(res.data[0]._id);
          this.loadDocs();
        }
      },
    });
  }

  loadDocs(): void {
    this.documentService
      .loadDocuments({
        companyId: this.selectedCompanyId() || undefined,
        competence: this.selectedCompetence() || undefined,
        module: this.selectedModule() || undefined,
        stage: this.selectedStage() || undefined,
      })
      .subscribe();
  }

  onFilterChange(): void {
    this.loadDocs();
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
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile.set(files[0]);
    }
  }

  submitUpload(): void {
    const file = this.selectedFile();
    if (!file || !this.selectedCompanyId()) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', this.selectedCompanyId());
    formData.append('competence', this.selectedCompetence());
    formData.append('module', this.uploadModule());
    formData.append('documentType', this.uploadDocType());

    this.documentService.uploadDocument(formData).subscribe({
      next: async () => {
        this.selectedFile.set(null);
        const toast = await this.toastCtrl.create({
          message: 'Arquivo enviado com sucesso para a esteira contábil!',
          duration: 3000,
          color: 'success',
          position: 'top',
        });
        toast.present();
      },
      error: async (err) => {
        const toast = await this.toastCtrl.create({
          message: err?.error?.error?.message || 'Erro ao enviar documento.',
          duration: 4000,
          color: 'danger',
          position: 'top',
        });
        toast.present();
      },
    });
  }

  // Transições de Estágio
  changeStage(doc: IDocumentItem, newStage: string): void {
    if (newStage === 'IMPEDIMENTO') {
      this.impedimentDocId.set(doc._id);
      this.impedimentReason.set('');
      this.isImpedimentModalOpen.set(true);
      return;
    }

    this.documentService.updateStage(doc._id, newStage).subscribe();
  }

  confirmImpediment(): void {
    const docId = this.impedimentDocId();
    const reason = this.impedimentReason().trim();

    if (!docId || !reason) return;

    this.documentService.updateStage(docId, 'IMPEDIMENTO', reason).subscribe({
      next: () => {
        this.isImpedimentModalOpen.set(false);
        this.impedimentDocId.set(null);
      },
    });
  }

  closeImpedimentModal(): void {
    this.isImpedimentModalOpen.set(false);
    this.impedimentDocId.set(null);
  }

  deleteDoc(doc: IDocumentItem): void {
    if (confirm(`Tem certeza que deseja excluir o documento '${doc.originalFilename}'?`)) {
      this.documentService.deleteDocument(doc._id).subscribe();
    }
  }

  closeCompetence(): void {
    const companyId = this.selectedCompanyId();
    const competence = this.selectedCompetence();
    const module = this.selectedModule() || 'FISCAL';

    if (!confirm(`Deseja realmente ENCERRAR e BLOQUEAR a competência ${competence} para novos envios?`)) {
      return;
    }

    this.documentService.closeCompetence(companyId, competence, module).subscribe({
      next: async (res) => {
        const toast = await this.toastCtrl.create({
          message: `Competência ${competence} encerrada com sucesso! ${res.data?.documentsClosed} arquivos bloqueados.`,
          duration: 4000,
          color: 'dark',
          position: 'top',
        });
        toast.present();
      },
    });
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  getStageBadge(stage: string): { label: string; color: string } {
    const found = this.stagesList.find((s) => s.value === stage);
    return found ? { label: found.label, color: found.color } : { label: stage, color: 'medium' };
  }
}
