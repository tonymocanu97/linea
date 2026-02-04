import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SearchDialogComponent } from '../search-dialog/search-dialog.component';
import { SettingsService } from '@shared';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SearchDialogComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentTime = '';
  currentDate = '';
  notificationsOpen = false;
  searchOpen = false;
  private timeInterval?: number;
  private timezoneOffset = 2;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private settingsService: SettingsService,
  ) {}

  ngOnInit() {
    this.timezoneOffset = this.settingsService.getTimezoneOffset();
    
    this.settingsService.timezone$.subscribe(() => {
      this.timezoneOffset = this.settingsService.getTimezoneOffset();
      this.updateTime();
      this.updateDate();
    });

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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchOpen = true;
    }
    if (event.key === 'Escape' && this.searchOpen) {
      this.searchOpen = false;
    }
  }

  openSearch(): void {
    this.searchOpen = true;
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private updateTime() {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime + (this.timezoneOffset * 3600000));
    
    this.currentTime = targetTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  private updateDate() {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime + (this.timezoneOffset * 3600000));
    
    this.currentDate = targetTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
