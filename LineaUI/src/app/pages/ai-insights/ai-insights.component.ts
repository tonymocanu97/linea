import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent, SidebarComponent } from '@components';
import { InsightsApiService } from '@shared/services';
import { toDateOnlyString } from '@shared/utils';
import { Bot, FileText, LucideAngularModule, Send, Sparkles, Wrench } from 'lucide-angular';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const PRESET_MAINTENANCE =
  'Based on the current production data, downtimes, and equipment status, provide predictive maintenance recommendations. Which equipment might need attention soon? What patterns do you see that could indicate upcoming failures?';

const PRESET_REPORT =
  'Generate a natural language production report summarizing the key metrics, downtimes, defects, and equipment performance for the selected period. Write it in a clear, executive-summary style.';

@Component({
  selector: 'app-ai-insights',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, HeaderComponent, SidebarComponent, LucideAngularModule],
  templateUrl: './ai-insights.component.html',
})
export class AiInsightsComponent {
  messages: ChatMessage[] = [];
  inputText = '';
  loading = false;
  error?: string;

  from = toDateOnlyString(new Date(Date.now() - 7 * 86400000));
  to = toDateOnlyString(new Date());
  lineName = '';

  bot = Bot;
  send = Send;
  sparkles = Sparkles;
  wrench = Wrench;
  fileText = FileText;

  constructor(private api: InsightsApiService) {}

  sendMessage(): void {
    const text = this.inputText?.trim();
    if (!text || this.loading) return;

    this.inputText = '';
    this.error = undefined;
    this.messages.push({ role: 'user', content: text, timestamp: new Date() });
    this.loading = true;

    this.api
      .ask({
        question: text,
        from: this.from,
        to: this.to,
        lineName: this.lineName?.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.messages.push({
            role: 'assistant',
            content: res.answer,
            timestamp: new Date(),
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.error ?? err?.message ?? 'Failed to get AI response.';
          this.loading = false;
        },
      });
  }

  usePreset(preset: 'maintenance' | 'report'): void {
    const question = preset === 'maintenance' ? PRESET_MAINTENANCE : PRESET_REPORT;
    this.inputText = question;
    this.sendMessage();
  }

  onPresetMaintenance(): void {
    this.usePreset('maintenance');
  }

  onPresetReport(): void {
    this.usePreset('report');
  }
}
