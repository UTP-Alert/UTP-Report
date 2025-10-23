import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoZonas } from './estado-zonas';

describe('EstadoZonas', () => {
  let component: EstadoZonas;
  let fixture: ComponentFixture<EstadoZonas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoZonas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoZonas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
