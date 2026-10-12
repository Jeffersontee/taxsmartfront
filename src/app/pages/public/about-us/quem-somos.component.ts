import { Component, signal } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  sparklesOutline,
  shieldCheckmarkOutline,
  peopleOutline,
  hardwareChipOutline,
  starOutline,
} from 'ionicons/icons';

interface ValueItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  standalone: true,
  selector: 'app-quem-somos',
  templateUrl: './quem-somos.component.html',
  styleUrls: ['./quem-somos.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonIcon],
})
export class QuemSomosComponent {
  readonly values: ValueItem[] = [
    {
      id: 'conformidade',
      icon: 'shield-checkmark-outline',
      title: 'Além da Conformidade',
      description:
        'Nosso compromisso vai além da conformidade. Atuamos como parceiros estratégicos, identificando oportunidades, reduzindo riscos, otimizando processos e fornecendo informações confiáveis para que empresários possam tomar decisões com segurança e visão de futuro.',
    },
    {
      id: 'relacionamento',
      icon: 'people-outline',
      title: 'Relacionamento Próximo',
      description:
        'O que nos diferencia é a forma como nos relacionamos com nossos clientes. Na TaxSmart, você tem acesso direto aos sócios e a uma equipe altamente qualificada, com atendimento ágil e personalizado. Valorizamos a proximidade, a transparência e a construção de relações duradouras.',
    },
    {
      id: 'tecnologia',
      icon: 'hardware-chip-outline',
      title: 'Tecnologia e Inovação',
      description:
        'Investimos continuamente em tecnologia, inovação e capacitação profissional para entregar um serviço moderno, eficiente e alinhado às constantes mudanças do ambiente empresarial e da legislação tributária.',
    },
    {
      id: 'sucesso',
      icon: 'star-outline',
      title: 'O Sucesso do Cliente',
      description:
        'Na TaxSmart, acreditamos que o sucesso dos nossos clientes é a nossa maior conquista. Mais do que prestar serviços contábeis, construímos parcerias que contribuem para o crescimento sustentável e para o fortalecimento do seu negócio.',
    },
  ];

  selectedCardIndex = signal<number | null>(null);

  constructor() {
    addIcons({
      sparklesOutline,
      shieldCheckmarkOutline,
      peopleOutline,
      hardwareChipOutline,
      starOutline,
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
