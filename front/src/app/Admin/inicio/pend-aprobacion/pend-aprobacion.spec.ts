import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendAprobacion } from './pend-aprobacion';

describe('PendAprobacion', () => {
  let component: PendAprobacion;
  let fixture: ComponentFixture<PendAprobacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendAprobacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendAprobacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
