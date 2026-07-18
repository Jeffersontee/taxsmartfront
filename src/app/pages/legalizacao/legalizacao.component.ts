import { IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-legalizacao',
  templateUrl: './legalizacao.component.html',
  styleUrls: ['./legalizacao.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonCard, IonCardContent],
})
export class LegalizacaoComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
