import { Component, OnInit } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline, cashOutline, calculatorOutline, fileTrayStackedOutline, documentOutline } from 'ionicons/icons';

@Component({
  selector: 'app-departamento-pessoal',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonIcon],
  templateUrl: './departamento-pessoal.component.html',
  styleUrls: ['./departamento-pessoal.component.scss'],
})
export class DepartamentoPessoalComponent implements OnInit {
  constructor() {
    addIcons({ peopleOutline, cashOutline, calculatorOutline, fileTrayStackedOutline, documentOutline });
  }
  ngOnInit() {}
}
