import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
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
  menuOutline,
  closeOutline,
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
export class AdminLayoutComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  isSettingsOpen = signal<boolean>(true);
  isCollapsed = signal<boolean>(
    localStorage.getItem('taxsmart_admin_sidebar_collapsed') === 'true'
  );
  isMobile = signal<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  isSidebarCollapsed = computed(() => {
    // No mobile a barra lateral em drawer nunca deve ser exibida no modo colapsado (72px sem rótulos)
    return !this.isMobile() && this.isCollapsed();
  });

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
      case UserRole.COMPANY_ADMIN:
      case UserRole.OWNER:
        return 'Titular / Diretor';
      case UserRole.PARTNER:
        return 'Sócio da Empresa';
      case UserRole.COMPANY_FINANCIAL:
        return 'Gestor Financeiro';
      case UserRole.COMPANY_EMPLOYEE:
        return 'Colaborador da Empresa';
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
      menuOutline,
      closeOutline,
    });
  }

  isMobileMenuOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.menuCtrl.enable(true, 'admin-menu');
  }

  @HostListener('window:resize')
  onResize(): void {
    const mobile = window.innerWidth < 768;
    this.isMobile.set(mobile);
    if (!mobile && this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  async toggleMenu(): Promise<void> {
    if (window.innerWidth >= 768) {
      this.toggleCollapse();
    } else {
      await this.menuCtrl.enable(true, 'admin-menu');
      const isOpen = await this.menuCtrl.isOpen('admin-menu');
      if (isOpen || this.isMobileMenuOpen()) {
        this.isMobileMenuOpen.set(false);
        await this.menuCtrl.close('admin-menu');
      } else {
        this.isMobileMenuOpen.set(true);
        await this.menuCtrl.open('admin-menu');
      }
    }
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

  async closeMobileMenu(): Promise<void> {
    this.isMobileMenuOpen.set(false);
    await this.menuCtrl.close('admin-menu');
  }

  async onNavClick(): Promise<void> {
    if (window.innerWidth < 768) {
      await this.closeMobileMenu();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

