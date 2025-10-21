import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminZonasPageCompleteComponent } from './zonas-page-complete.component';

describe('AdminZonasPageCompleteComponent', () => {
  let component: AdminZonasPageCompleteComponent;
  let fixture: ComponentFixture<AdminZonasPageCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminZonasPageCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminZonasPageCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
