import { IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-planejamento-financeiro',
  templateUrl: './planejamento-financeiro.component.html',
  styleUrls: ['./planejamento-financeiro.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonCard, IonCardContent],
})
export class PlanejamentoFinanceiroComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
