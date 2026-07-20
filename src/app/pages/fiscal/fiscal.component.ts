import { Component, OnInit } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-fiscal',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonIcon],
  templateUrl: './fiscal.component.html',
  styleUrls: ['./fiscal.component.scss'],
})
export class FiscalComponent implements OnInit {
  constructor() {
    addIcons({ documentTextOutline, shieldCheckmarkOutline });
  }
  ngOnInit() {}
}
