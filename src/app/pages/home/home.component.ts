import { Component } from '@angular/core';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonContent
} from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { QuemSomosComponent } from '../quem-somos/quem-somos.component';
import { NossosValoresComponent } from '../nossos-valores/nossos-valores.component';
import { ServicosComponent } from '../servicos/servicos.component';
import { RamosDeAtividadesComponent } from '../ramos-de-atividades/ramos-de-atividades.component';
import { ConsultoriaComponent } from '../consultoria/consultoria.component';
import { ContatoComponent } from '../contato/contato.component';
import { FiscalComponent } from '../fiscal/fiscal.component';
import { DepartamentoPessoalComponent } from '../departamento-pessoal/departamento-pessoal.component';
import { LegalizacaoComponent } from '../legalizacao/legalizacao.component';
import { ContabilidadeComponent } from '../contabilidade/contabilidade.component';
import { PlanejamentoFinanceiroComponent } from '../planejamento-financeiro/planejamento-financeiro.component';

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
