import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paginas } from './paginas';

describe('Paginas', () => {
  let component: Paginas;
  let fixture: ComponentFixture<Paginas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paginas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Paginas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
