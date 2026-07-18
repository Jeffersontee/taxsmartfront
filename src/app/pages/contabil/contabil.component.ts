import { IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-contabil',
  templateUrl: './contabil.component.html',
  styleUrls: ['./contabil.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonCard, IonCardContent],
})
export class ContabilComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
