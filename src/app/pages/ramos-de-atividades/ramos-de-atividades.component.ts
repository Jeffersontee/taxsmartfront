import { Component } from '@angular/core';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { hardwareChipOutline, constructOutline, briefcaseOutline } from 'ionicons/icons';

@Component({
  selector: 'app-ramos-de-atividades',
  standalone: true,
  imports: [
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton
  ],
  templateUrl: './ramos-de-atividades.component.html',
  styleUrls: ['./ramos-de-atividades.component.scss'],
})
export class RamosDeAtividadesComponent {
  constructor() {
    addIcons({ hardwareChipOutline, constructOutline, briefcaseOutline });
  }
}
