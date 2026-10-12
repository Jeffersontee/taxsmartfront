import { IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-servicos-tributario',
  templateUrl: './servicos-tributario.component.html',
  styleUrls: ['./servicos-tributario.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonCard, IonCardContent],
})
export class ServicosTributarioComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
