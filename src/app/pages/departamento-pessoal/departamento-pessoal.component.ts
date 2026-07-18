import { IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { checkmarkCircle, logoWhatsapp, locationOutline, mailOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-departamento-pessoal',
  templateUrl: './departamento-pessoal.component.html',
  styleUrls: ['./departamento-pessoal.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon, IonButton],
})
export class DepartamentoPessoalComponent implements OnInit {
  constructor() {
    addIcons({ checkmarkCircle, logoWhatsapp, locationOutline, mailOutline });
  }

  ngOnInit() {}
}
