import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnProceso } from './en-proceso';

describe('EnProceso', () => {
  let component: EnProceso;
  let fixture: ComponentFixture<EnProceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnProceso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnProceso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
