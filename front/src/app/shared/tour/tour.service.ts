import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TourStep {
  title?: string;
  content: string;
  selector?: string; // css selector to point at (optional)
}

@Injectable({ providedIn: 'root' })
export class TourService {
  private steps: TourStep[] = [];
  private index$ = new BehaviorSubject<number>(0);
  private open$ = new BehaviorSubject<boolean>(false);

  readonly isOpen$ = this.open$.asObservable();
  readonly indexObservable$ = this.index$.asObservable();

  constructor(){
    // default: load completed flag
  }

  init(steps: TourStep[]){
    this.steps = steps || [];
    this.index$.next(0);
  }

  open(startIndex = 0){
    if (!this.steps || this.steps.length === 0) return;
    this.index$.next(startIndex);
    this.open$.next(true);
  }

  close(){
    this.open$.next(false);
  }

  next(){
    const i = this.index$.value;
    if (i < this.steps.length - 1) this.index$.next(i + 1);
    else this.complete();
  }

  prev(){
    const i = this.index$.value;
    if (i > 0) this.index$.next(i - 1);
  }

  stepCount(){
    return this.steps.length;
  }

  stepAt(i: number){
    return this.steps[i];
  }

  currentIndex(){
    return this.index$.value;
  }

  complete(){
    // mark finished in localStorage
    localStorage.setItem('utp_report_tour_completed', '1');
    this.close();
  }

  isCompleted(){
    return localStorage.getItem('utp_report_tour_completed') === '1';
  }
}
