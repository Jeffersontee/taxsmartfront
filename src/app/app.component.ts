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
      setTimeout(() => this.executeScroll(sectionId), 150);
    } else {
      this.executeScroll(sectionId);
    }
  }

  private async executeScroll(sectionId: string, attempts = 0) {
    const contentEl = document.querySelector('ion-content#home-content') as any;

    if (sectionId === 'top' || sectionId === 'main-content') {
      if (contentEl) {
        contentEl.scrollToTop(500);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const element = document.getElementById(sectionId);

    if (element && contentEl) {
      const scrollElement = await contentEl.getScrollElement();
      const headerOffset = 80;
      const elementRect = element.getBoundingClientRect();
      const currentScrollTop = scrollElement.scrollTop;
      const targetY = elementRect.top + currentScrollTop - headerOffset;

      contentEl.scrollToPoint(0, Math.max(0, targetY), 500);
    } else if (attempts < 5) {
      // Se o elemento estiver sendo hidratado pelo @defer ou transição, tenta novamente
      setTimeout(() => this.executeScroll(sectionId, attempts + 1), 60);
    } else if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
