import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectRol } from './select-rol';

describe('SelectRol', () => {
  let component: SelectRol;
  let fixture: ComponentFixture<SelectRol>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectRol]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectRol);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
