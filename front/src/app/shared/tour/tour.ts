import { Component, OnDestroy, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from './tour.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour.html',
  styleUrls: ['./tour.scss']
})
export class TourComponent implements OnInit, OnDestroy {
  isOpen = signal(false);
  currentIndex = signal(0);
  stepCount = 0;

  private subs: Subscription[] = [];

  constructor(private tour: TourService){ }

  ngOnInit(): void {
    this.stepCount = this.tour.stepCount();
    // subscribe to open and index
    const s1 = this.tour.isOpen$.subscribe((v: boolean) => this.isOpen.set(v));
    const s2 = this.tour.indexObservable$.subscribe((i: number) => this.currentIndex.set(i));
    this.subs.push(s1, s2);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  close(){
    this.tour.close();
  }

  next(){
    this.tour.next();
  }

  skip(){
    this.tour.complete();
  }

  step(): import('./tour.service').TourStep | undefined {
    return this.tour.stepAt(this.currentIndex());
  }
}
