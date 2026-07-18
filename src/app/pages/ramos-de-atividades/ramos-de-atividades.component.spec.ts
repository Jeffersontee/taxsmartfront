import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RamosDeAtividadesComponent } from './ramos-de-atividades.component';

describe('RamosDeAtividadesComponent', () => {
  let component: RamosDeAtividadesComponent;
  let fixture: ComponentFixture<RamosDeAtividadesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RamosDeAtividadesComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(RamosDeAtividadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
