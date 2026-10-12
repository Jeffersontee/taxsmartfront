import { Component, signal } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pieChartOutline, trendingUpOutline } from 'ionicons/icons';

interface AccountingItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-contabilidade',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonIcon],
  templateUrl: './contabilidade.component.html',
  styleUrls: ['./contabilidade.component.scss'],
})
export class ContabilidadeComponent {
  readonly items: AccountingItem[] = [
    {
      id: 'balancetes',
      icon: 'pie-chart-outline',
      title: 'Balancetes de Elite',
      description: 'Visão clara, atualizada e precisa da saúde financeira da sua empresa.',
    },
    {
      id: 'apoio',
      icon: 'trending-up-outline',
      title: 'Apoio Estratégico',
      description: 'Números reais que embasam o crescimento seguro e previsível do seu negócio.',
    },
  ];

  selectedCardIndex = signal<number | null>(null);

  constructor() {
    addIcons({ pieChartOutline, trendingUpOutline });
  }

  selectCard(index: number): void {
    if (this.selectedCardIndex() === index) {
      this.selectedCardIndex.set(null);
    } else {
      this.selectedCardIndex.set(index);
    }
  }
}
