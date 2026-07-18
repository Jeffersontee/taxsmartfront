import { IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-contabilidade',
  templateUrl: './contabilidade.component.html',
  styleUrls: ['./contabilidade.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonCard, IonCardContent],
})
export class ContabilidadeComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
