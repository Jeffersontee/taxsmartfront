import { Component, signal } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { businessOutline, listOutline } from 'ionicons/icons';

interface LegalizationItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-legalizacao',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonIcon],
  templateUrl: './legalizacao.component.html',
  styleUrls: ['./legalizacao.component.scss'],
})
export class LegalizacaoComponent {
  readonly items: LegalizationItem[] = [
    {
      id: 'quadro',
      icon: 'business-outline',
      title: 'Quadro Societário',
      description: 'Estruturação ideal e blindagem legal para o perfil do seu negócio.',
    },
    {
      id: 'atividades',
      icon: 'list-outline',
      title: 'Atividades Econômicas',
      description: 'Escolha assertiva de CNAEs visando máxima otimização tributária.',
    },
  ];

  selectedCardIndex = signal<number | null>(null);

  constructor() {
    addIcons({ businessOutline, listOutline });
  }

  selectCard(index: number): void {
    if (this.selectedCardIndex() === index) {
      this.selectedCardIndex.set(null);
    } else {
      this.selectedCardIndex.set(index);
    }
  }
}
