import { Component, OnInit } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-depoimentos',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonIcon],
  templateUrl: './depoimentos.component.html',
  styleUrls: ['./depoimentos.component.scss'],
})
export class DepoimentosComponent  implements OnInit {

  constructor() {
    addIcons({ playCircleOutline });
  }

  ngOnInit() {}

}
