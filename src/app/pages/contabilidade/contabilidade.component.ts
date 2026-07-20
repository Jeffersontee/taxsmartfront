import { Component, OnInit } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pieChartOutline, trendingUpOutline } from 'ionicons/icons';

@Component({
  selector: 'app-contabilidade',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonIcon],
  templateUrl: './contabilidade.component.html',
  styleUrls: ['./contabilidade.component.scss'],
})
export class ContabilidadeComponent implements OnInit {
  constructor() {
    addIcons({ pieChartOutline, trendingUpOutline });
  }
  ngOnInit() {}
}
