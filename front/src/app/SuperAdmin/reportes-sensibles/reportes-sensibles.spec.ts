import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesSensibles } from './reportes-sensibles';

describe('ReportesSensibles', () => {
  let component: ReportesSensibles;
  let fixture: ComponentFixture<ReportesSensibles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesSensibles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesSensibles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
