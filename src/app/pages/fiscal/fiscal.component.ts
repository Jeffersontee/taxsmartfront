import { IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-fiscal',
  templateUrl: './fiscal.component.html',
  styleUrls: ['./fiscal.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonCard, IonCardContent],
})
export class FiscalComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
