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
  IonSearchbar,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  shieldCheckmarkOutline,
  warningOutline,
  closeCircleOutline,
  informationCircleOutline,
  searchOutline,
  filterOutline,
  timeOutline,
  personOutline,
  globeOutline,
  documentTextOutline,
  businessOutline,
} from 'ionicons/icons';
import { AuditFrontService, IAuditLogItem } from '../../../services/audit/audit.service';

@Component({
  selector: 'app-admin-audit',
  templateUrl: './admin-audit.component.html',
  styleUrls: ['./admin-audit.component.scss'],
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
    IonSearchbar,
    IonCard,
    IonCardContent,
  ],
})
export class AdminAuditComponent implements OnInit {
  auditService = inject(AuditFrontService);

  logs = this.auditService.logs;
  summary = this.auditService.summary;
  isLoading = this.auditService.isLoading;

  selectedSeverity = signal<string>('');
  selectedModule = signal<string>('');
  searchTerm = signal<string>('');

  modulesList = ['FISCAL', 'CONTABIL', 'DP', 'RH', 'COMPANIES', 'AUTH', 'STAFF', 'SYSTEM_SETTINGS'];

  filteredLogs = computed(() => {
    let list = this.logs();
    const term = this.searchTerm().toLowerCase().trim();

    if (term) {
      list = list.filter(
        (l) =>
          l.action.toLowerCase().includes(term) ||
          (l.description && l.description.toLowerCase().includes(term)) ||
          (l.userName && l.userName.toLowerCase().includes(term)) ||
          (l.userEmail && l.userEmail.toLowerCase().includes(term))
      );
    }

    return list;
  });

  constructor() {
    addIcons({
      shieldCheckmarkOutline,
      warningOutline,
      closeCircleOutline,
      informationCircleOutline,
      searchOutline,
      filterOutline,
      timeOutline,
      personOutline,
      globeOutline,
      documentTextOutline,
      businessOutline,
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.auditService
      .loadLogs({
        severity: this.selectedSeverity() || undefined,
        module: this.selectedModule() || undefined,
      })
      .subscribe();

    this.auditService.loadSummary().subscribe();
  }

  onFilterChange(): void {
    this.loadData();
  }

  getSeverityBadge(severity: string): { label: string; color: string; icon: string } {
    switch (severity) {
      case 'critical':
        return { label: 'CRÍTICO', color: 'danger', icon: 'close-circle-outline' };
      case 'error':
        return { label: 'ERRO', color: 'danger', icon: 'close-circle-outline' };
      case 'warn':
        return { label: 'ALERTA', color: 'warning', icon: 'warning-outline' };
      default:
        return { label: 'INFO', color: 'primary', icon: 'information-circle-outline' };
    }
  }
}
