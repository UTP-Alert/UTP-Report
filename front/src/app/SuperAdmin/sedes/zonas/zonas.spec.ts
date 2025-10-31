import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Zonas } from './zonas';

describe('Zonas', () => {
  let component: Zonas;
  let fixture: ComponentFixture<Zonas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Zonas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Zonas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
