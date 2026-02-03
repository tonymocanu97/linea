import { Component } from '@angular/core';
import { Settings, LucideAngularModule } from 'lucide-angular';
import { SidebarComponent } from '@components/sidebar/sidebar.component';
import { HeaderComponent } from '@components/header/header.component';
import { FormsModule } from '@angular/forms';

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
