import { Component } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { walletOutline, documentTextOutline, syncOutline, barChartOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-planejamento-financeiro',
  templateUrl: './planejamento-financeiro.component.html',
  styleUrls: ['./planejamento-financeiro.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonIcon],
})
export class PlanejamentoFinanceiroComponent {
  constructor() {
    addIcons({ walletOutline, documentTextOutline, syncOutline, barChartOutline });
  }
}
