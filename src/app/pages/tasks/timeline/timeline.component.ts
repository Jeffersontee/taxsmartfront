import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonProgressBar,
  IonToast,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  checkmarkCircleOutline,
  alertCircle,
  alertCircleOutline,
  timeOutline,
  closeCircle,
  calendarOutline,
  businessOutline,
  chatbubblesOutline,
  documentAttachOutline,
  filterOutline,
  chevronForwardOutline,
  warningOutline,
  refreshOutline,
  copyOutline,
  downloadOutline,
  flashOutline,
  layersOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { TaskService } from '../../../services/task/task.service';
import { CompanyService } from '../../../services/company/company.service';
import { AuthService } from '../../../services/auth/auth.service';
import { TaskStatus, TaskCategory, ITask } from '../../../models/task.model';

@Component({
  standalone: true,
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner,
    IonSelect,
    IonSelectOption,
    IonProgressBar,
    IonToast,
  ],
})
export class TimelineComponent implements OnInit {
  taskService = inject(TaskService);
  companyService = inject(CompanyService);
  authService = inject(AuthService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  readonly TaskStatus = TaskStatus;
  readonly TaskCategory = TaskCategory;

  readonly competences = ['10/2026', '09/2026', '08/2026', '07/2026', '06/2026'];
  readonly categories = [
    { label: 'Todas as Categorias', value: '' },
    { label: 'Fiscal / Tributário', value: TaskCategory.FISCAL },
    { label: 'Contábil / Balancetes', value: TaskCategory.CONTABIL },
    { label: 'Folha de Pagamento / DP', value: TaskCategory.FOLHA },
    { label: 'Legalização / Societário', value: TaskCategory.LEGALIZACAO },
    { label: 'Financeiro / BPO', value: TaskCategory.FINANCEIRO },
  ];

  toastMessage = signal<string>('');
  isToastOpen = signal<boolean>(false);

  // Computeds
  isAccountant = computed(() => this.authService.isAccountant());

  constructor() {
    addIcons({
      checkmarkCircle,
      checkmarkCircleOutline,
      alertCircle,
      alertCircleOutline,
      timeOutline,
      closeCircle,
      calendarOutline,
      businessOutline,
      chatbubblesOutline,
      documentAttachOutline,
      filterOutline,
      chevronForwardOutline,
      warningOutline,
      refreshOutline,
      copyOutline,
      downloadOutline,
      flashOutline,
      layersOutline,
      shieldCheckmarkOutline,
    });
  }

  ngOnInit(): void {
    this.fetchData();
    this.companyService.loadCompanies().subscribe();
  }

  fetchData(): void {
    this.taskService.loadTasks().subscribe();
    this.taskService.loadSummary().subscribe();
  }

  onCompetenceChange(event: any): void {
    const val = event.detail.value;
    this.taskService.selectedCompetence.set(val);
    this.fetchData();
  }

  onCompanyChange(event: any): void {
    const val = event.detail.value;
    this.taskService.selectedCompanyId.set(val);
    this.fetchData();
  }

  onCategoryChange(event: any): void {
    const val = event.detail.value;
    this.taskService.selectedCategory.set(val);
  }

  onFilterChange(event: any): void {
    const val = event.detail.value;
    this.taskService.selectedStatusFilter.set(val);
  }

  copyPixCode(pixCode?: string): void {
    const code =
      pixCode ||
      '00020126580014br.gov.bcb.pix0136taxsmart-pagamentos-pix-chave-aleatoria5204000053039865802BR5925TAXSMART CONTABILIDADE6009SAO PAULO62070503***6304E2D1';
    navigator.clipboard.writeText(code);
    this.showToast('Código PIX Copia e Cola copiado com sucesso!');
  }

  copyBarcode(barcode?: string): void {
    const code = barcode || '85800000001956000179261008000000000000000000';
    navigator.clipboard.writeText(code);
    this.showToast('Código de Barras copiado com sucesso!');
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    this.isToastOpen.set(true);
  }

  async openStatusAction(task: ITask): Promise<void> {
    if (!this.isAccountant()) {
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Alterar Status da Obrigação',
      subHeader: task.title,
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Justificativa ou detalhes (obrigatório se marcar Impedimento)...',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Concluir',
          cssClass: 'status-btn-success',
          handler: (data) => this.updateStatus(task._id, TaskStatus.CONCLUIDO, data.reason),
        },
        {
          text: 'Impedimento',
          cssClass: 'status-btn-warning',
          handler: (data) => this.updateStatus(task._id, TaskStatus.IMPEDIMENTO, data.reason),
        },
        {
          text: 'Desconsiderar',
          cssClass: 'status-btn-medium',
          handler: (data) => this.updateStatus(task._id, TaskStatus.DESCONSIDERADO, data.reason),
        },
        {
          text: 'Reabrir',
          handler: (data) => this.updateStatus(task._id, TaskStatus.ABERTA, data.reason),
        },
      ],
    });

    await alert.present();
  }

  private updateStatus(taskId: string, status: TaskStatus, reason?: string): void {
    this.taskService.updateStatus(taskId, status, reason).subscribe({
      next: async () => {
        this.showToast(`Status atualizado para ${this.getStatusLabel(status)}`);
        this.taskService.loadSummary().subscribe();
      },
      error: async (err) => {
        const msg = err?.error?.error?.message || err?.error?.message || 'Erro ao alterar status';
        this.showToast(msg);
      },
    });
  }

  getStatusBadgeColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.CONCLUIDO:
        return 'success';
      case TaskStatus.IMPEDIMENTO:
        return 'danger';
      case TaskStatus.ABERTA:
        return 'warning';
      case TaskStatus.DESCONSIDERADO:
        return 'medium';
      default:
        return 'light';
    }
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.CONCLUIDO:
        return 'Concluído';
      case TaskStatus.IMPEDIMENTO:
        return 'Impedimento';
      case TaskStatus.DESCONSIDERADO:
        return 'Desconsiderado';
      case TaskStatus.ABERTA:
      default:
        return 'Em Aberto';
    }
  }

  getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.CONCLUIDO:
        return 'checkmark-circle';
      case TaskStatus.IMPEDIMENTO:
        return 'alert-circle';
      case TaskStatus.ABERTA:
        return 'time-outline';
      case TaskStatus.DESCONSIDERADO:
        return 'close-circle';
      default:
        return 'time-outline';
    }
  }
}
