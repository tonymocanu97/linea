import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent, SidebarComponent } from '@components';
import { SettingsService } from '@shared';
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
export class SettingsComponent implements OnInit {
  settingsIcon = Settings;

  companyName = 'Production Form';
  timezone = 'UTC+2 (Central European Time)';
  saving = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.companyName = this.settingsService.getCompanyName();
    this.timezone = this.settingsService.getTimezone();
  }

  save(): void {
    this.saving = true;
    
    this.settingsService.setCompanyName(this.companyName);
    this.settingsService.setTimezone(this.timezone);

    setTimeout(() => {
      this.saving = false;
    }, 800);
  }
}
