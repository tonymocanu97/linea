import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, SettingsService } from '@shared/services';
import { formatDate, formatTime, getTargetTime } from '@shared/utils';
import { Subject, takeUntil } from 'rxjs';
import { SearchDialogComponent } from './components';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SearchDialogComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentTime = '';
  currentDate = '';
  notificationsOpen = false;
  searchOpen = false;
  userMenuOpen = false;
  user = inject(AuthService).user;

  private destroy$ = new Subject<void>();
  private timeInterval?: number;
  private timezoneOffset = 2;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private settingsService: SettingsService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.timezoneOffset = this.settingsService.getTimezoneOffset();

    this.settingsService.timezone$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.timezoneOffset = this.settingsService.getTimezoneOffset();
      this.updateDateTime();
    });

    this.updateDateTime();

    this.ngZone.runOutsideAngular(() => {
      this.timeInterval = window.setInterval(() => {
        this.ngZone.run(() => {
          this.updateDateTime();
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

  logout(): void {
    this.userMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateDateTime(): void {
    const target = getTargetTime(this.timezoneOffset);
    this.currentTime = formatTime(target);
    this.currentDate = formatDate(target);
  }
}
