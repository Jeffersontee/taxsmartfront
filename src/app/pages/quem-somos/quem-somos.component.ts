import { IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-quem-somos',
  templateUrl: './quem-somos.component.html',
  styleUrls: ['./quem-somos.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonCard, IonCardContent],
})
export class QuemSomosComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
