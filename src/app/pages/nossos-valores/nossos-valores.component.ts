import { Component } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForwardCircleOutline,
  bulbOutline,
  shieldCheckmarkOutline,
  peopleOutline,
  searchOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-nossos-valores',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonIcon],
  templateUrl: './nossos-valores.component.html',
  styleUrls: ['./nossos-valores.component.scss'],
})
export class NossosValoresComponent {
  constructor() {
    addIcons({
      arrowForwardCircleOutline,
      bulbOutline,
      shieldCheckmarkOutline,
      peopleOutline,
      searchOutline,
    });
  }
}
