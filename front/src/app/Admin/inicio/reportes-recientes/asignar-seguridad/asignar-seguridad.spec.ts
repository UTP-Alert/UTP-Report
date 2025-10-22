import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarSeguridad } from './asignar-seguridad';

describe('AsignarSeguridad', () => {
  let component: AsignarSeguridad;
  let fixture: ComponentFixture<AsignarSeguridad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarSeguridad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarSeguridad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
