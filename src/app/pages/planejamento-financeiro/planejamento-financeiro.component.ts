import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  walletOutline,
  documentTextOutline,
  syncOutline,
  barChartOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

interface BpoItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  standalone: true,
  selector: 'app-planejamento-financeiro',
  templateUrl: './planejamento-financeiro.component.html',
  styleUrls: ['./planejamento-financeiro.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonIcon],
})
export class PlanejamentoFinanceiroComponent implements OnInit, OnDestroy {
  readonly items: BpoItem[] = [
    {
      id: 'contas',
      icon: 'wallet-outline',
      title: 'Contas a Pagar e Receber',
      description: 'Gestão ágil e eficiente de todo o seu fluxo de obrigações e recebíveis.',
    },
    {
      id: 'faturamento',
      icon: 'document-text-outline',
      title: 'Faturamento',
      description: 'Emissão de notas fiscais e boletos com precisão e pontualidade.',
    },
    {
      id: 'rotina',
      icon: 'sync-outline',
      title: 'Rotina Financeira',
      description: 'Conciliação financeira diária e gestão completa do fluxo de caixa.',
    },
    {
      id: 'decisoes',
      icon: 'bar-chart-outline',
      title: 'Decisões Estratégicas',
      description: 'Relatórios financeiros e dashboards de indicadores para decisões assertivas.',
    },
  ];

  selectedCardIndex = signal<number | null>(null);
  currentSlideIndex = signal<number>(0);

  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;
  private readonly autoPlayIntervalMs = 3500;

  constructor() {
    addIcons({
      walletOutline,
      documentTextOutline,
      syncOutline,
      barChartOutline,
      chevronBackOutline,
      chevronForwardOutline,
    });
  }

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      const nextIndex = (this.currentSlideIndex() + 1) % this.items.length;
      this.currentSlideIndex.set(nextIndex);
    }, this.autoPlayIntervalMs);
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  selectCard(index: number) {
    if (this.selectedCardIndex() === index) {
      this.selectedCardIndex.set(null);
    } else {
      this.selectedCardIndex.set(index);
    }
    this.currentSlideIndex.set(index);
    this.startAutoPlay();
  }

  prevSlide() {
    const newIndex = (this.currentSlideIndex() - 1 + this.items.length) % this.items.length;
    this.currentSlideIndex.set(newIndex);
    this.startAutoPlay();
  }

  nextSlide() {
    const newIndex = (this.currentSlideIndex() + 1) % this.items.length;
    this.currentSlideIndex.set(newIndex);
    this.startAutoPlay();
  }

  goToSlide(index: number) {
    this.currentSlideIndex.set(index);
    this.startAutoPlay();
  }
}
