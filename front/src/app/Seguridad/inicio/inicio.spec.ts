import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioSeguridad } from './inicio';

describe('InicioSeguridad', () => {
  let component: InicioSeguridad;
  let fixture: ComponentFixture<InicioSeguridad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioSeguridad]
    })
    .compileComponents();

  fixture = TestBed.createComponent(InicioSeguridad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
