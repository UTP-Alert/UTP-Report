import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cancelados } from './cancelados';

describe('Cancelados', () => {
  let component: Cancelados;
  let fixture: ComponentFixture<Cancelados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cancelados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cancelados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
