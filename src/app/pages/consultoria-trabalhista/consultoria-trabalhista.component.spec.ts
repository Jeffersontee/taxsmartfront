import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConsultoriaTrabalhistaComponent } from './consultoria-trabalhista.component';

describe('ConsultoriaTrabalhistaComponent', () => {
  let component: ConsultoriaTrabalhistaComponent;
  let fixture: ComponentFixture<ConsultoriaTrabalhistaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultoriaTrabalhistaComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultoriaTrabalhistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
