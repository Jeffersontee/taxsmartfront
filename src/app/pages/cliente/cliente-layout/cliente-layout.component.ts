import { Component, inject } from '@angular/core';
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
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
