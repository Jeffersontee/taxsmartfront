import { Component } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUpOutline, barChartOutline, briefcaseOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-consultoria',
  templateUrl: './consultoria.component.html',
  styleUrls: ['./consultoria.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonIcon],
})
export class ConsultoriaComponent {
  constructor() {
    addIcons({ trendingUpOutline, barChartOutline, briefcaseOutline });
  }
}
