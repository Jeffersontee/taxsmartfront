import { Component, OnInit, inject, signal } from '@angular/core';
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
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cloudOutline,
  cloudDoneOutline,
  serverOutline,
  logoGoogle,
  shieldCheckmarkOutline,
  folderOpenOutline,
  refreshOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  copyOutline,
  documentTextOutline,
  timeOutline,
  arrowForwardOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { DocumentService } from '../../../../services/document/document.service';

@Component({
  selector: 'app-storage-settings',
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
    IonToast,
  ],
  templateUrl: './storage-settings.component.html',
  styleUrl: './storage-settings.component.scss',
})
export class StorageSettingsComponent implements OnInit {
  private documentService = inject(DocumentService);

  isLoading = signal<boolean>(false);
  isTesting = signal<boolean>(false);
  activeProvider = signal<string>('CLOUDINARY');
  storageData = signal<any>(null);

  toastMessage = signal<string>('');
  showToast = signal<boolean>(false);
  toastColor = signal<'success' | 'danger' | 'warning'>('success');

  testResult = signal<{ ok: boolean; message: string; details?: any } | null>(null);

  constructor() {
    addIcons({
      cloudOutline,
      cloudDoneOutline,
      serverOutline,
      logoGoogle,
      shieldCheckmarkOutline,
      folderOpenOutline,
      refreshOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      copyOutline,
      documentTextOutline,
      timeOutline,
      arrowForwardOutline,
      lockClosedOutline,
    });
  }

  ngOnInit(): void {
    this.loadStorageStatus();
  }

  loadStorageStatus(): void {
    this.isLoading.set(true);
    this.documentService.getStorageStatus().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.data) {
          this.storageData.set(res.data);
          this.activeProvider.set(res.data.activeProvider || 'CLOUDINARY');
        }
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  testCloudinary(): void {
    this.isTesting.set(true);
    this.testResult.set(null);
    this.documentService.testCloudinaryConnection().subscribe({
      next: (res) => {
        this.isTesting.set(false);
        if (res.data) {
          this.testResult.set(res.data);
          if (res.data.ok) {
            this.triggerToast('Conexão com Cloudinary verificada com sucesso!', 'success');
          } else {
            this.triggerToast(res.data.message || 'Falha ao conectar.', 'warning');
          }
        }
      },
      error: (err) => {
        this.isTesting.set(false);
        this.testResult.set({
          ok: false,
          message: err?.error?.error?.message || 'Falha de comunicação com a API do Cloudinary.',
        });
        this.triggerToast('Erro no teste de conectividade.', 'danger');
      },
    });
  }

  setActiveProvider(providerId: string): void {
    if (this.activeProvider() === providerId) return;

    this.documentService.setActiveStorageProvider(providerId).subscribe({
      next: () => {
        this.activeProvider.set(providerId);
        this.triggerToast(`Provedor de armazenamento alterado para ${providerId}`, 'success');
        this.loadStorageStatus();
      },
      error: () => {
        this.triggerToast('Não foi possível alterar o provedor ativo.', 'danger');
      },
    });
  }

  triggerToast(message: string, color: 'success' | 'danger' | 'warning'): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.showToast.set(true);
  }
}

