import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoIncidentes } from './tipo-incidentes';

describe('TipoIncidentes', () => {
  let component: TipoIncidentes;
  let fixture: ComponentFixture<TipoIncidentes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoIncidentes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoIncidentes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
