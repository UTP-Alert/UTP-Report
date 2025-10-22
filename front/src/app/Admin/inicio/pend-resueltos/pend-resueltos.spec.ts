import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendResueltos } from './pend-resueltos';

describe('PendResueltos', () => {
  let component: PendResueltos;
  let fixture: ComponentFixture<PendResueltos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendResueltos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendResueltos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
