import { Component, OnInit, inject, signal } from '@angular/core';
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
} from 'ionicons/icons';
import { TaskService } from '../../../services/task/task.service';
import { CompanyService } from '../../../services/company/company.service';
import { AuthService } from '../../../services/auth/auth.service';
import { TaskStatus, TaskCategory } from '../../../models/task.model';

@Component({
  selector: 'app-admin-dashboard',
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
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  taskService = inject(TaskService);
  companyService = inject(CompanyService);
  authService = inject(AuthService);

  readonly currentCompetence = '10/2026';
  readonly TaskStatus = TaskStatus;
  readonly TaskCategory = TaskCategory;

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
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.taskService.loadSummary(this.currentCompetence).subscribe();
    this.taskService.loadTasks({ competence: this.currentCompetence }).subscribe();
    this.companyService.loadCompanies().subscribe();
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
