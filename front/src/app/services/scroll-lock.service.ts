import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollLockService {
  private lockCount = 0;

  lock(): void {
    try {
      this.lockCount = Math.max(0, this.lockCount) + 1;
      document.body.style.overflow = 'hidden';
    } catch {}
  }

  unlock(): void {
    try {
      this.lockCount = Math.max(0, this.lockCount - 1);
      if (this.lockCount === 0) {
        document.body.style.overflow = '';
      }
    } catch {}
  }

  reset(): void {
    try {
      this.lockCount = 0;
      document.body.style.overflow = '';
    } catch {}
  }

  /** For diagnostics or conditional flows */
  isLocked(): boolean {
    return this.lockCount > 0 || document.body.style.overflow === 'hidden';
  }
}
