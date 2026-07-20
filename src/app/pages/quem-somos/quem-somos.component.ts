import { IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { hardwareChipOutline, peopleOutline, shieldCheckmarkOutline, starOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-quem-somos',
  templateUrl: './quem-somos.component.html',
  styleUrls: ['./quem-somos.component.scss'],
  imports: [IonIcon, IonGrid, IonRow, IonCol, IonIcon ],
})
export class QuemSomosComponent implements OnInit {
  constructor() {
    addIcons({ hardwareChipOutline, starOutline, peopleOutline, shieldCheckmarkOutline })
  }

  ngOnInit() {}
}
