import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedBack } from './feed-back';

describe('FeedBack', () => {
  let component: FeedBack;
  let fixture: ComponentFixture<FeedBack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedBack]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedBack);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
