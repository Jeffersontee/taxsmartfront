import { Component } from '@angular/core';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonContent
} from '@ionic/angular/standalone';
import { FooterComponent } from '../../../components/footer/footer.component';
import { QuemSomosComponent } from '../about-us/quem-somos.component';
import { NossosValoresComponent } from '../values/nossos-valores.component';
import { ServicosComponent } from '../services/servicos.component';
import { RamosDeAtividadesComponent } from '../segments/ramos-de-atividades.component';
import { ConsultoriaComponent } from '../services-consulting/consultoria.component';
import { ContatoComponent } from '../contact/contato.component';
import { FiscalComponent } from '../services-fiscal/fiscal.component';
import { DepartamentoPessoalComponent } from '../services-payroll/departamento-pessoal.component';
import { LegalizacaoComponent } from '../services-legal/legalizacao.component';
import { ContabilidadeComponent } from '../services-accounting/contabilidade.component';
import { PlanejamentoFinanceiroComponent } from '../financial-planning/planejamento-financeiro.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonGrid,
    IonRow,
    IonCol,
    IonContent,
    FooterComponent,
    QuemSomosComponent,
    NossosValoresComponent,
    ServicosComponent,
    RamosDeAtividadesComponent,
    ConsultoriaComponent,
    ContatoComponent,
    FiscalComponent,
    ContabilidadeComponent,
    DepartamentoPessoalComponent,
    LegalizacaoComponent,
    PlanejamentoFinanceiroComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
