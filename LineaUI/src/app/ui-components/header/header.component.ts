import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentTime = '';
  currentDate = '';
  private timeInterval?: number;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.updateTime();
    this.updateDate();

    this.ngZone.runOutsideAngular(() => {
      this.timeInterval = window.setInterval(() => {
        this.ngZone.run(() => {
          this.updateTime();
          this.cdr.markForCheck();
        });
      }, 1000);
    });
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private updateTime() {
    this.currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  private updateDate() {
    this.currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
