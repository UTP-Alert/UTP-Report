import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportaAhora } from './reporta-ahora';

describe('ReportaAhora', () => {
  let component: ReportaAhora;
  let fixture: ComponentFixture<ReportaAhora>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportaAhora]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportaAhora);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
