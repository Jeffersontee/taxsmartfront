import { Component } from '@angular/core';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bulbOutline, cogOutline, helpBuoyOutline, playCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon],
  templateUrl: './servicos.component.html',
  styleUrls: ['./servicos.component.scss'],
})
export class ServicosComponent {
  constructor() {
    addIcons({ bulbOutline, cogOutline, helpBuoyOutline, playCircleOutline });
  }
}
