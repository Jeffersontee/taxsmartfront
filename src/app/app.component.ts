import { Component, HostListener, ViewChild } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import {
  IonApp,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonList,
  IonItem,
  IonLabel,
  IonItemDivider,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logoInstagram,
  logoLinkedin,
  logoWhatsapp,
  menuOutline,
  callOutline,
  mailOutline,
  locationOutline,
  arrowUpOutline,
} from 'ionicons/icons';

interface ClickParticle {
  x: number;
  y: number;
  id: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    IonApp,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonList,
    IonItem,
    IonLabel,
    IonItemDivider,
    IonRouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  particles: ClickParticle[] = [];
  particleId = 0;

  constructor(private router: Router) {
    addIcons({
      logoInstagram,
      logoLinkedin,
      logoWhatsapp,
      menuOutline,
      callOutline,
      mailOutline,
      locationOutline,
      arrowUpOutline,
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const p: ClickParticle = {
      x: event.clientX,
      y: event.clientY,
      id: this.particleId++,
    };
    this.particles.push(p);

    setTimeout(() => {
      this.particles = this.particles.filter((item) => item.id !== p.id);
    }, 1000);
  }

  async scrollTo(sectionId: string) {
    if (this.router.url !== '/' && this.router.url !== '/home') {
      await this.router.navigate(['/']);
      setTimeout(() => this.executeScroll(sectionId), 200); // Aguarda a home renderizar
    } else {
      this.executeScroll(sectionId);
    }
  }

  private async executeScroll(sectionId: string) {
    const element = document.getElementById(sectionId);
    const contentEl = document.querySelector('ion-content#home-content') as any;

    if (element && contentEl) {
      const scrollElement = await contentEl.getScrollElement();
      const y = element.getBoundingClientRect().top + scrollElement.scrollTop - 80;
      contentEl.scrollToPoint(0, y, 500);
    } else {
      console.warn('Falha no scroll: Elemento ou ionContent ausente!');
    }
  }
}
