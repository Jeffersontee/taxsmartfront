import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DepartamentoPessoalComponent } from './departamento-pessoal.component';

describe('DepartamentoPessoalComponent', () => {
  let component: DepartamentoPessoalComponent;
  let fixture: ComponentFixture<DepartamentoPessoalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DepartamentoPessoalComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartamentoPessoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
