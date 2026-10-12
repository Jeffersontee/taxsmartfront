import { IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-consultoria-trabalhista',
  templateUrl: './consultoria-trabalhista.component.html',
  styleUrls: ['./consultoria-trabalhista.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonCard, IonCardContent],
})
export class ConsultoriaTrabalhistaComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
