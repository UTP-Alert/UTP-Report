import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZonasPageCompleteComponent } from './zonas-page-complete.component';

describe('ZonasPageCompleteComponent', () => {
  let component: ZonasPageCompleteComponent;
  let fixture: ComponentFixture<ZonasPageCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonasPageCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonasPageCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
