import { Component, signal } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, shieldCheckmarkOutline } from 'ionicons/icons';

interface FiscalItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-fiscal',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonIcon],
  templateUrl: './fiscal.component.html',
  styleUrls: ['./fiscal.component.scss'],
})
export class FiscalComponent {
  readonly items: FiscalItem[] = [
    {
      id: 'obrigacoes',
      icon: 'document-text-outline',
      title: 'Obrigações Acessórias',
      description: 'Entrega rigorosa de todas as declarações exigidas pelo fisco.',
    },
    {
      id: 'conformidade',
      icon: 'shield-checkmark-outline',
      title: 'Conformidade Total',
      description: 'Tranquilidade e segurança máxima para as operações da sua empresa.',
    },
  ];

  selectedCardIndex = signal<number>(0);

  constructor() {
    addIcons({ documentTextOutline, shieldCheckmarkOutline });
  }

  selectCard(index: number): void {
    this.selectedCardIndex.set(index);
  }
}
