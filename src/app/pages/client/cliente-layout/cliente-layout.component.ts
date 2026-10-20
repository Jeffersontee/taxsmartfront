import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  IonSelect,
  IonSelectOption,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridOutline,
  businessOutline,
  timeOutline,
  documentTextOutline,
  cloudUploadOutline,
  chatbubblesOutline,
  logOutOutline,
  notificationsOutline,
  personCircleOutline,
  shieldCheckmarkOutline,
  walletOutline,
  chevronForwardOutline,
  chevronBackOutline,
  addOutline,
  folderOpenOutline,
  receiptOutline,
  peopleOutline,
  cashOutline,
  swapHorizontalOutline,
  colorPaletteOutline,
  menuOutline,
  closeOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { CompanyService } from '../../../services/company/company.service';
import { ICompany } from '../../../models/company.model';

@Component({
  selector: 'app-cliente-layout',
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
    IonSelect,
    IonSelectOption,
  ],
  templateUrl: './cliente-layout.component.html',
  styleUrl: './cliente-layout.component.scss',
})
export class ClienteLayoutComponent implements OnInit {
  authService = inject(AuthService);
  companyService = inject(CompanyService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  companies = this.companyService.companies;
  selectedCompany = this.companyService.selectedCompany;
  activeCompetence = signal<string>('10/2026');

  isCollapsed = signal<boolean>(
    localStorage.getItem('taxsmart_client_sidebar_collapsed') === 'true'
  );
  isMobile = signal<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  isSidebarCollapsed = computed(() => {
    return !this.isMobile() && this.isCollapsed();
  });

  isMobileMenuOpen = signal<boolean>(false);

  constructor() {
    addIcons({
      gridOutline,
      businessOutline,
      timeOutline,
      documentTextOutline,
      cloudUploadOutline,
      chatbubblesOutline,
      logOutOutline,
      notificationsOutline,
      personCircleOutline,
      shieldCheckmarkOutline,
      walletOutline,
      chevronForwardOutline,
      chevronBackOutline,
      addOutline,
      folderOpenOutline,
      receiptOutline,
      peopleOutline,
      cashOutline,
      swapHorizontalOutline,
      colorPaletteOutline,
      menuOutline,
      closeOutline,
    });
  }

  ngOnInit(): void {
    this.menuCtrl.enable(true, 'client-menu');

    this.companyService.loadCompanies().subscribe((res) => {
      if (res.data && res.data.length > 0 && !this.companyService.selectedCompany()) {
        this.companyService.selectedCompany.set(res.data[0]);
      }
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    const mobile = window.innerWidth < 768;
    this.isMobile.set(mobile);
    if (!mobile && this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  onCompanyChange(companyId: string): void {
    const found = this.companies().find((c) => c._id === companyId);
    if (found) {
      this.companyService.selectedCompany.set(found);
    }
  }

  hasModule(module: string): boolean {
    const comp = this.selectedCompany();
    if (!comp || !comp.allowedModules || comp.allowedModules.length === 0) {
      return true; // Se não houver restrição explícita, exibe por padrão
    }
    return comp.allowedModules.includes(module);
  }

  async toggleMenu(): Promise<void> {
    if (window.innerWidth >= 768) {
      this.toggleCollapse();
    } else {
      await this.menuCtrl.enable(true, 'client-menu');
      const isOpen = await this.menuCtrl.isOpen('client-menu');
      if (isOpen || this.isMobileMenuOpen()) {
        this.isMobileMenuOpen.set(false);
        await this.menuCtrl.close('client-menu');
      } else {
        this.isMobileMenuOpen.set(true);
        await this.menuCtrl.open('client-menu');
      }
    }
  }

  toggleCollapse(): void {
    this.isCollapsed.update((val) => {
      const next = !val;
      localStorage.setItem('taxsmart_client_sidebar_collapsed', String(next));
      return next;
    });
  }

  async closeMobileMenu(): Promise<void> {
    this.isMobileMenuOpen.set(false);
    await this.menuCtrl.close('client-menu');
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

