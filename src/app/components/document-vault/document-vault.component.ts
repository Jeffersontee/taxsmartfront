import { Component, OnInit, inject, signal, computed, effect, untracked, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cloudUploadOutline,
  documentTextOutline,
  eyeOutline,
  downloadOutline,
  trashOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  lockClosedOutline,
  filterOutline,
  refreshOutline,
  timeOutline,
  folderOpenOutline,
  closeOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { DocumentService, IDocumentItem } from '../../services/document/document.service';
import { AuthService } from '../../services/auth/auth.service';
import { DocumentPreviewModalComponent } from '../document-preview-modal/document-preview-modal.component';

@Component({
  selector: 'app-document-vault',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonBadge,
    IonSpinner,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    DocumentPreviewModalComponent,
  ],
  templateUrl: './document-vault.component.html',
  styleUrl: './document-vault.component.scss',
})
export class DocumentVaultComponent implements OnInit {
  // Signal Inputs com defaults robustos
  companyId = input<string | null>(null);
  competence = input<string>('10/2026');
  module = input<'FISCAL' | 'CONTABIL' | 'DP' | 'RH' | 'GERAL'>('FISCAL');
  title = input<string>('Cofre de Documentos');
  subtitle = input<string>('Gestão, esteira e auditoria de arquivos contábeis');
  allowUpload = input<boolean>(true);
  readOnly = input<boolean>(false);

  // Outputs para notificar componentes pais
  documentSelected = output<IDocumentItem>();
  documentUploaded = output<IDocumentItem>();
  documentDeleted = output<string>();

  // Injeção de dependências
  private documentService = inject(DocumentService);
  authService = inject(AuthService);
  private toastCtrl = inject(ToastController);

  // Signals de estado interno
  documents = signal<IDocumentItem[]>([]);
  isLoading = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  isDragging = signal<boolean>(false);
  searchTerm = signal<string>('');
  selectedStageFilter = signal<string>('ALL');

  // Preview Modal State
  selectedPreviewDoc = signal<IDocumentItem | null>(null);
  isPreviewOpen = signal<boolean>(false);

  // Impediment Modal State
  selectedImpedimentDoc = signal<IDocumentItem | null>(null);
  impedimentReason = signal<string>('');
  isImpedimentModalOpen = signal<boolean>(false);

  // Documentos filtrados reativamente
  filteredDocuments = computed(() => {
    let list = this.documents();
    const query = this.searchTerm().trim().toLowerCase();
    const stage = this.selectedStageFilter();

    if (stage !== 'ALL') {
      list = list.filter((doc) => doc.stage === stage);
    }

    if (query) {
      list = list.filter(
        (doc) =>
          doc.originalFilename.toLowerCase().includes(query) ||
          doc.documentType.toLowerCase().includes(query) ||
          (doc.uploadedBy?.userName || '').toLowerCase().includes(query)
      );
    }

    return list;
  });

  isCompetenceClosed = computed(() => {
    const list = this.documents();
    return list.some((d) => d.isCompetenceClosed);
  });

  constructor() {
    addIcons({
      cloudUploadOutline,
      documentTextOutline,
      eyeOutline,
      downloadOutline,
      trashOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      lockClosedOutline,
      filterOutline,
      refreshOutline,
      timeOutline,
      folderOpenOutline,
      closeOutline,
      shieldCheckmarkOutline,
      informationCircleOutline,
    });

    // Reage automaticamente a mudanças nas propriedades pai
    effect(
      () => {
        const cId = this.companyId();
        const comp = this.competence();
        const mod = this.module();
        if (cId) {
          untracked(() => {
            this.loadDocuments();
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    // Carregamento reativo gerenciado pelo effect()
  }

  loadDocuments(): void {
    const cId = this.companyId();
    if (!cId) return;

    this.isLoading.set(true);
    this.documentService
      .loadDocuments({
        companyId: cId,
        competence: this.competence(),
        module: this.module(),
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.success && res.data) {
            this.documents.set(res.data.documents || []);
          }
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadSingleFile(input.files[0]);
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.uploadSingleFile(event.dataTransfer.files[0]);
    }
  }

  uploadSingleFile(file: File): void {
    const cId = this.companyId();
    if (!cId) {
      this.showToast('Nenhuma empresa selecionada para o envio.', 'danger');
      return;
    }

    if (this.isCompetenceClosed()) {
      this.showToast('A competência está formalmente fechada para novos envios.', 'warning');
      return;
    }

    this.isUploading.set(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', cId);
    formData.append('competence', this.competence());
    formData.append('module', this.module());

    // Define o tipo de documento baseado na extensão
    const ext = file.name.split('.').pop()?.toUpperCase() || 'ARQUIVO';
    formData.append('documentType', ext);

    this.documentService.uploadDocument(formData).subscribe({
      next: (res) => {
        this.isUploading.set(false);
        const uploadedDoc = res.data;
        if (res.success && uploadedDoc) {
          this.documents.update((docs) => [uploadedDoc, ...docs]);
          this.documentUploaded.emit(uploadedDoc);
          this.showToast(`Arquivo '${file.name}' enviado com sucesso!`, 'success');
        }
      },
      error: (err) => {
        this.isUploading.set(false);
        const msg = err?.error?.error?.message || err?.error?.message || 'Erro ao realizar upload do arquivo.';
        this.showToast(msg, 'danger');
      },
    });
  }

  openPreview(doc: IDocumentItem): void {
    this.selectedPreviewDoc.set(doc);
    this.isPreviewOpen.set(true);
    this.documentSelected.emit(doc);
  }

  closePreview(): void {
    this.isPreviewOpen.set(false);
    this.selectedPreviewDoc.set(null);
  }

  onDownload(doc: IDocumentItem): void {
    window.open(doc.fileUrl, '_blank');
  }

  approveDocument(doc: IDocumentItem): void {
    this.documentService.updateStage(doc._id, 'APROVADO').subscribe({
      next: (res) => {
        const approvedDoc = res.data;
        if (res.success && approvedDoc) {
          this.documents.update((list) =>
            list.map((item) => (item._id === doc._id ? approvedDoc : item))
          );
          this.showToast(`Documento '${doc.originalFilename}' aprovado com sucesso!`, 'success');
        }
      },
    });
  }

  openImpedimentDialog(doc: IDocumentItem): void {
    this.selectedImpedimentDoc.set(doc);
    this.impedimentReason.set(doc.impedimentReason || '');
    this.isImpedimentModalOpen.set(true);
  }

  closeImpedimentDialog(): void {
    this.isImpedimentModalOpen.set(false);
    this.selectedImpedimentDoc.set(null);
    this.impedimentReason.set('');
  }

  confirmImpediment(): void {
    const doc = this.selectedImpedimentDoc();
    const reason = this.impedimentReason().trim();

    if (!doc) return;
    if (!reason) {
      this.showToast('Informe a justificativa ou documento faltante.', 'warning');
      return;
    }

    this.documentService.updateStage(doc._id, 'IMPEDIMENTO', reason).subscribe({
      next: (res) => {
        const impedimentDoc = res.data;
        if (res.success && impedimentDoc) {
          this.documents.update((list) =>
            list.map((item) => (item._id === doc._id ? impedimentDoc : item))
          );
          this.closeImpedimentDialog();
          this.showToast('Pendência registrada e notificada com sucesso.', 'warning');
        }
      },
    });
  }

  deleteDocument(doc: IDocumentItem): void {
    if (!confirm(`Deseja realmente excluir o documento '${doc.originalFilename}'?`)) {
      return;
    }

    this.documentService.deleteDocument(doc._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.documents.update((list) => list.filter((item) => item._id !== doc._id));
          this.documentDeleted.emit(doc._id);
          this.showToast('Documento excluído com sucesso.', 'success');
        }
      },
      error: (err) => {
        const msg = err?.error?.error?.message || 'Erro ao excluir documento.';
        this.showToast(msg, 'danger');
      },
    });
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  getStageColor(stage: string): string {
    switch (stage) {
      case 'APROVADO':
        return 'success';
      case 'EM_ANALISE':
        return 'warning';
      case 'IMPEDIMENTO':
        return 'danger';
      case 'PROCESSADO':
        return 'secondary';
      case 'FECHADO':
        return 'medium';
      default:
        return 'primary';
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 3000,
      position: 'top',
    });
    await toast.present();
  }
}
