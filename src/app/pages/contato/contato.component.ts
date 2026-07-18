import { Component } from '@angular/core';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButton,
  IonInput,
  IonTextarea,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoWhatsapp, callOutline, locationOutline, mailOutline, sendOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.scss'],
  imports: [
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
    IonInput,
    IonTextarea,
    IonItem,
    IonLabel
  ],
})
export class ContatoComponent {
  constructor() {
    addIcons({ logoWhatsapp, callOutline, locationOutline, mailOutline, sendOutline });
  }
}
