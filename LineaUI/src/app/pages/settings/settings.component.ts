import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent, SidebarComponent } from '@components';
import { LucideAngularModule, Settings } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    LucideAngularModule,
    SidebarComponent,
    HeaderComponent,
    FormsModule,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  settingsIcon = Settings;

  companyName = 'Production Form Inc.';
  timezone = 'UTC-5 (Eastern Time)';
  saving = false;

  save(): void {
    this.saving = true;

    setTimeout(() => {
      this.saving = false;
    }, 800);
  }
}
