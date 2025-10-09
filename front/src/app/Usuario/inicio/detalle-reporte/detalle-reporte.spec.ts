import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleReporte } from './detalle-reporte';

describe('DetalleReporte', () => {
  let component: DetalleReporte;
  let fixture: ComponentFixture<DetalleReporte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleReporte]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleReporte);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
