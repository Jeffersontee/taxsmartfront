import { Component, input, output, computed, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonBadge,
  IonFooter,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  downloadOutline,
  documentTextOutline,
  imageOutline,
  codeSlashOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
  personCircleOutline,
  shieldCheckmarkOutline,
  eyeOutline,
  refreshOutline,
} from 'ionicons/icons';
import { DocumentService, IDocumentItem, IAuditLogItem } from '../../services/document/document.service';

@Component({
  selector: 'app-document-preview-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonBadge,
    IonFooter,
    IonSpinner,
  ],
  templateUrl: './document-preview-modal.component.html',
  styleUrl: './document-preview-modal.component.scss',
})
export class DocumentPreviewModalComponent {
  private documentService = inject(DocumentService);

  document = input.required<IDocumentItem>();
  isOpen = input<boolean>(false);

  closeModal = output<void>();
  downloadTriggered = output<IDocumentItem>();

  // Signals de Auditoria
  auditLogs = signal<IAuditLogItem[]>([]);
  isLoadingAudit = signal<boolean>(false);

  isImage = computed(() => {
    const doc = this.document();
    if (!doc) return false;
    const mime = (doc.mimeType || '').toLowerCase();
    const name = (doc.originalFilename || '').toLowerCase();
    return (
      mime.startsWith('image/') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.webp')
    );
  });

  isPdf = computed(() => {
    const doc = this.document();
    if (!doc) return false;
    const mime = (doc.mimeType || '').toLowerCase();
    const name = (doc.originalFilename || '').toLowerCase();
    return mime.includes('pdf') || name.endsWith('.pdf');
  });

  isCodeOrXml = computed(() => {
    const doc = this.document();
    if (!doc) return false;
    const name = (doc.originalFilename || '').toLowerCase();
    return name.endsWith('.xml') || name.endsWith('.ofx') || name.endsWith('.json');
  });

  formattedSize = computed(() => {
    const doc = this.document();
    if (!doc || !doc.fileSizeBytes) return '0 KB';
    const bytes = doc.fileSizeBytes;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  });

  stageBadgeColor = computed(() => {
    const stage = this.document()?.stage;
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
  });

  stageLabel = computed(() => {
    const stage = this.document()?.stage;
    switch (stage) {
      case 'ENVIADO':
        return 'Enviado';
      case 'EM_ANALISE':
        return 'Em Análise pelo Escritório';
      case 'APROVADO':
        return 'Aprovado para Apuração';
      case 'IMPEDIMENTO':
        return 'Com Pendência / Impedimento';
      case 'PROCESSADO':
        return 'Processado no Módulo';
      case 'FECHADO':
        return 'Competência Fechada';
      default:
        return 'Pendente';
    }
  });

  constructor() {
    addIcons({
      closeOutline,
      downloadOutline,
      documentTextOutline,
      imageOutline,
      codeSlashOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      timeOutline,
      personCircleOutline,
      shieldCheckmarkOutline,
      eyeOutline,
      refreshOutline,
    });

    // Efeito reativo para auditar leitura/visualização em tela e carregar histórico
    effect(
      () => {
        const isModalOpen = this.isOpen();
        const doc = this.document();
        if (isModalOpen && doc?._id) {
          untracked(() => {
            this.recordViewAndLoadAudit(doc._id);
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  recordViewAndLoadAudit(docId: string): void {
    // 1. Registra no backend que o documento foi lido/visualizado em tela
    this.documentService.logDocumentView(docId).subscribe();

    // 2. Carrega a trilha de auditoria completa
    this.isLoadingAudit.set(true);
    this.documentService.getDocumentAuditHistory(docId).subscribe({
      next: (res) => {
        if (res.data) {
          this.auditLogs.set(res.data);
        }
        this.isLoadingAudit.set(false);
      },
      error: () => {
        this.isLoadingAudit.set(false);
      },
    });
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'DOCUMENT_UPLOADED':
        return 'Arquivo Enviado';
      case 'DOCUMENT_VIEWED':
        return 'Visualizado em Tela';
      case 'DOCUMENT_DOWNLOADED':
        return 'Download Realizado';
      case 'DOCUMENT_STAGE_CHANGED':
        return 'Estágio Alterado';
      case 'DOCUMENT_IMPEDIMENT':
        return 'Pendência Apontada';
      case 'COMPETENCE_CLOSED':
        return 'Competência Fechada';
      case 'DOCUMENT_DELETED':
        return 'Arquivo Excluído';
      default:
        return action;
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onDownload(): void {
    const doc = this.document();
    if (!doc) return;

    // Registra a auditoria de download
    this.documentService.logDocumentDownload(doc._id).subscribe();
    this.downloadTriggered.emit(doc);
    window.open(doc.fileUrl, '_blank');
  }
}
