import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this._loading$.asObservable();

  private activeRequests = 0;

  show(): void {
    this.activeRequests += 1;
    if (this.activeRequests > 0) this._loading$.next(true);
    try { document.body.classList.add('is-loading'); } catch (_) {}
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) this._loading$.next(false);
    try { if (this.activeRequests === 0) document.body.classList.remove('is-loading'); } catch (_) {}
  }

  reset(): void {
    this.activeRequests = 0;
    this._loading$.next(false);
  }
}
