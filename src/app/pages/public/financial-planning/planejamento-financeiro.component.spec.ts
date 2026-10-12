import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PlanejamentoFinanceiroComponent } from './planejamento-financeiro.component';

describe('PlanejamentoFinanceiroComponent', () => {
  let component: PlanejamentoFinanceiroComponent;
  let fixture: ComponentFixture<PlanejamentoFinanceiroComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlanejamentoFinanceiroComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanejamentoFinanceiroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
