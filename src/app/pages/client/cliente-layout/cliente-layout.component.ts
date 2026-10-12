import { Component, inject, signal } from '@angular/core';
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
  cloudUploadOutline,
  chatbubblesOutline,
  logOutOutline,
  notificationsOutline,
  personCircleOutline,
  shieldCheckmarkOutline,
  walletOutline,
  chevronForwardOutline,
  chevronBackOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';

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
  ],
  templateUrl: './cliente-layout.component.html',
  styleUrl: './cliente-layout.component.scss',
})
export class ClienteLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

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
    });
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

