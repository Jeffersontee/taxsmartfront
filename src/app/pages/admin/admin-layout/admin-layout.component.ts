import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonIcon,
  IonLabel,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonRouterOutlet,
  IonBadge,
  IonAvatar,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridOutline,
  businessOutline,
  timeOutline,
  documentTextOutline,
  calculatorOutline,
  peopleOutline,
  logOutOutline,
  notificationsOutline,
  shieldCheckmarkOutline,
  personCircleOutline,
  settingsOutline,
  colorPaletteOutline,
  chevronDownOutline,
  chevronForwardOutline,
  chevronBackOutline,
  constructOutline,
  personAddOutline,
  folderOpenOutline,
  receiptOutline,
  peopleCircleOutline,
  lockClosedOutline,
  helpCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonIcon,
    IonLabel,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonRouterOutlet,
    IonBadge,
    IonAvatar,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  isSettingsOpen = signal<boolean>(true);
  isCollapsed = signal<boolean>(
    localStorage.getItem('taxsmart_admin_sidebar_collapsed') === 'true'
  );

  roleLabel = computed(() => {
    const role = this.authService.currentUser()?.role;
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Administrador';
      case UserRole.ACCOUNTANT:
        return 'Contador Responsável';
      case UserRole.FISCAL_ANALYST:
        return 'Analista Fiscal';
      case UserRole.PAYROLL_ANALYST:
        return 'Analista de DP/RH';
      case UserRole.CLIENT_ADMIN:
        return 'Titular / Diretor';
      case UserRole.CLIENT_FINANCIAL:
        return 'Gestor Financeiro';
      default:
        return 'Membro da Equipe';
    }
  });

  constructor() {
    addIcons({
      gridOutline,
      businessOutline,
      timeOutline,
      documentTextOutline,
      calculatorOutline,
      peopleOutline,
      logOutOutline,
      notificationsOutline,
      shieldCheckmarkOutline,
      personCircleOutline,
      settingsOutline,
      colorPaletteOutline,
      chevronDownOutline,
      chevronForwardOutline,
      chevronBackOutline,
      constructOutline,
      personAddOutline,
      folderOpenOutline,
      receiptOutline,
      peopleCircleOutline,
      lockClosedOutline,
      helpCircleOutline,
    });
  }


  toggleCollapse(): void {
    this.isCollapsed.update((val) => {
      const next = !val;
      localStorage.setItem('taxsmart_admin_sidebar_collapsed', String(next));
      return next;
    });
  }

  toggleSettings(): void {
    this.isSettingsOpen.update((open) => !open);
  }

  onNavClick(): void {
    // No mobile fecha o menu automaticamente após clicar em um link
    this.menuCtrl.close();
  }

  logout(): void {
    this.authService.logout();
  }
}

