import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesAsignados } from './reportes-asignados';

describe('ReportesAsignados', () => {
  let component: ReportesAsignados;
  let fixture: ComponentFixture<ReportesAsignados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesAsignados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesAsignados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
