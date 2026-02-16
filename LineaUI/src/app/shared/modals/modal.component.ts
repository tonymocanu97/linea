import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf, LucideAngularModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="close()"></div>

      <div
        class="relative z-50 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg animate-fade-in mx-4"
      >
        <button
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          (click)="close()"
        >
          <lucide-icon [name]="xIcon" class="h-4 w-4"></lucide-icon>
          <span class="sr-only">Close</span>
        </button>

        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class ModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  xIcon = X;

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
