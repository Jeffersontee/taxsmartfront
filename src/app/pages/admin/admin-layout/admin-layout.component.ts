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
  constructOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';

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

  isSettingsOpen = signal<boolean>(true);

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
      constructOutline,
    });
  }

  toggleSettings(): void {
    this.isSettingsOpen.update((open) => !open);
  }

  logout(): void {
    this.authService.logout();
  }
}

