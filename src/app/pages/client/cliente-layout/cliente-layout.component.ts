import { Component, OnInit, inject, signal } from '@angular/core';
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
    });
  }

  ngOnInit(): void {
    this.companyService.loadCompanies().subscribe((res) => {
      if (res.data && res.data.length > 0 && !this.companyService.selectedCompany()) {
        this.companyService.selectedCompany.set(res.data[0]);
      }
    });
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

  toggleCollapse(): void {
    this.isCollapsed.update((val) => {
      const next = !val;
      localStorage.setItem('taxsmart_client_sidebar_collapsed', String(next));
      return next;
    });
  }

  onNavClick(): void {
    // No mobile fecha o menu automaticamente após clicar em um link
    this.menuCtrl.close();
  }

  logout(): void {
    this.authService.logout();
  }
}

