import { Component, signal } from '@angular/core';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  hardwareChipOutline,
  constructOutline,
  briefcaseOutline,
} from 'ionicons/icons';

interface SectorItem {
  id: string;
  icon: string;
  title: string;
  items: string[];
}

@Component({
  selector: 'app-ramos-de-atividades',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonIcon],
  templateUrl: './ramos-de-atividades.component.html',
  styleUrls: ['./ramos-de-atividades.component.scss'],
})
export class RamosDeAtividadesComponent {
  readonly sectors: SectorItem[] = [
    {
      id: 'tecnologia',
      icon: 'hardware-chip-outline',
      title: 'Tecnologia',
      items: [
        'Desenvolvedores',
        'Programação',
        'Serviços de TI',
        'Consultoria de TI',
        'Web Design',
      ],
    },
    {
      id: 'construcao',
      icon: 'construct-outline',
      title: 'Construção Civil',
      items: ['Construção e Reforma', 'Manutenção', 'Energia'],
    },
    {
      id: 'servicos',
      icon: 'briefcase-outline',
      title: 'Serviços',
      items: [
        'Advocacia',
        'Cursos e Treinamentos',
        'Representantes',
        'Segurança',
        'Medicina',
      ],
    },
  ];

  selectedCardIndex = signal<number | null>(null);

  constructor() {
    addIcons({ hardwareChipOutline, constructOutline, briefcaseOutline });
  }

  selectCard(index: number): void {
    if (this.selectedCardIndex() === index) {
      this.selectedCardIndex.set(null);
    } else {
      this.selectedCardIndex.set(index);
    }
  }
}
