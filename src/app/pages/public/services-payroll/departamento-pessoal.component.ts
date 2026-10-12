import { Component, signal } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  cashOutline,
  calculatorOutline,
  fileTrayStackedOutline,
  documentOutline,
} from 'ionicons/icons';

interface DpItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-departamento-pessoal',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonIcon],
  templateUrl: './departamento-pessoal.component.html',
  styleUrls: ['./departamento-pessoal.component.scss'],
})
export class DepartamentoPessoalComponent {
  readonly items: DpItem[] = [
    {
      id: 'admissoes',
      icon: 'people-outline',
      title: 'Admissões e Rescisões',
      description: 'Gestão completa da entrada e saída de colaboradores.',
    },
    {
      id: 'folha',
      icon: 'cash-outline',
      title: 'Folha de Pagamento',
      description: 'Elaboração impecável de recibos, férias, pró-labore e adiantamentos.',
    },
    {
      id: 'encargos',
      icon: 'calculator-outline',
      title: 'Encargos Trabalhistas',
      description: 'Apuração rigorosa de IRRF, INSS, FGTS e demais contribuições.',
    },
    {
      id: 'obrigacoes',
      icon: 'file-tray-stacked-outline',
      title: 'Obrigações Acessórias',
      description: 'Transmissão segura de SEFIP, CAGED, RAIS e e-Social.',
    },
    {
      id: 'informes',
      icon: 'document-outline',
      title: 'Informes de Rendimentos',
      description: 'Elaboração técnica e entrega anual aos colaboradores.',
    },
  ];

  selectedCardIndex = signal<number | null>(1);

  constructor() {
    addIcons({
      peopleOutline,
      cashOutline,
      calculatorOutline,
      fileTrayStackedOutline,
      documentOutline,
    });
  }

  selectCard(index: number): void {
    if (this.selectedCardIndex() === index) {
      this.selectedCardIndex.set(null);
    } else {
      this.selectedCardIndex.set(index);
    }
  }
}
