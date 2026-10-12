import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonBadge,
  IonSpinner,
  IonProgressBar,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  businessOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
  removeCircleOutline,
  arrowForwardOutline,
  refreshOutline,
  calculatorOutline,
  documentTextOutline,
  peopleOutline,
  flashOutline,
  copyOutline,
  cloudUploadOutline,
  downloadOutline,
  walletOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { TaskService } from '../../../services/task/task.service';
import { CompanyService } from '../../../services/company/company.service';
import { AuthService } from '../../../services/auth/auth.service';
import { TaskStatus, TaskCategory, ITask } from '../../../models/task.model';
import { UserCompany } from '../../../models/user.model';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButton,
    IonBadge,
    IonSpinner,
    IonProgressBar,
    IonToast,
  ],
  templateUrl: './cliente-dashboard.component.html',
  styleUrl: './cliente-dashboard.component.scss',
})
export class ClienteDashboardComponent implements OnInit {
  taskService = inject(TaskService);
  companyService = inject(CompanyService);
  authService = inject(AuthService);

  readonly currentCompetence = '10/2026';
  readonly TaskStatus = TaskStatus;
  readonly TaskCategory = TaskCategory;

  toastMessage = signal<string>('');
  isToastOpen = signal<boolean>(false);

  // Computeds
  companyName = computed(() => {
    const user = this.authService.currentUser();
    const company = typeof user?.companyId === 'object' ? (user.companyId as UserCompany) : null;
    return company?.corporateName || company?.tradeName || company?.name || 'Sua Empresa';
  });

  companyCnpj = computed(() => {
    const user = this.authService.currentUser();
    const company = typeof user?.companyId === 'object' ? (user.companyId as UserCompany) : null;
    return company?.cnpj || 'CNPJ não informado';
  });

  companyTaxRegime = computed(() => {
    const user = this.authService.currentUser();
    const company = typeof user?.companyId === 'object' ? (user.companyId as UserCompany) : null;
    return company?.taxRegime || company?.tax_regime || 'Simples Nacional';
  });

  constructor() {
    addIcons({
      businessOutline,
      checkmarkCircleOutline,
      timeOutline,
      alertCircleOutline,
      removeCircleOutline,
      arrowForwardOutline,
      refreshOutline,
      calculatorOutline,
      documentTextOutline,
      peopleOutline,
      flashOutline,
      copyOutline,
      cloudUploadOutline,
      downloadOutline,
      walletOutline,
      shieldCheckmarkOutline,
      informationCircleOutline,
    });
  }

  ngOnInit(): void {
    this.loadClientData();
  }

  loadClientData(): void {
    const user = this.authService.currentUser();
    const companyId =
      typeof user?.companyId === 'object'
        ? (user.companyId as UserCompany)._id
        : user?.companyId;

    this.taskService.loadSummary(this.currentCompetence, companyId).subscribe();
    this.taskService
      .loadTasks({
        competence: this.currentCompetence,
        companyId: companyId,
      })
      .subscribe();

    this.companyService.loadCompanies().subscribe();
  }

  copyPixCode(pixCode: string | undefined): void {
    const code = pixCode || '00020126580014br.gov.bcb.pix0136taxsmart-pagamentos-pix-chave-aleatoria5204000053039865802BR5925TAXSMART CONTABILIDADE6009SAO PAULO62070503***6304E2D1';
    navigator.clipboard.writeText(code);
    this.showToast('Código PIX Copia e Cola copiado com sucesso!');
  }

  copyBarcode(barcode: string | undefined): void {
    const code = barcode || '85800000001956000179261008000000000000000000';
    navigator.clipboard.writeText(code);
    this.showToast('Código de Barras copiado com sucesso!');
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    this.isToastOpen.set(true);
  }

  getStatusBadgeColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.CONCLUIDO:
        return 'success';
      case TaskStatus.IMPEDIMENTO:
        return 'danger';
      case TaskStatus.DESCONSIDERADO:
        return 'medium';
      case TaskStatus.ABERTA:
      default:
        return 'warning';
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
}
