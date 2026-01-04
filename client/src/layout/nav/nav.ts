import { afterNextRender, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';
import { themes } from '../theme';
import { BusyService } from '../../core/services/busy-service';
import { HasRole } from '../../shared/directives/has-role';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive, HasRole],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  protected accountService = inject(AccountService);
  protected router = inject(Router);
  private toast = inject(ToastService);
  protected busyService = inject(BusyService);
  protected creds: any = {};
  protected loggedin = signal(false);
  protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
  protected themes = themes;
  protected adminRole: string[] = ['Admin', 'Moderator'];
  protected loading = signal(false);

  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.selectedTheme());
  }

  handleSelectedTheme(theme: string) {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', this.selectedTheme());
    const elem = document.activeElement as HTMLDivElement;
    if (elem) elem.blur();
  }

  handleSelectUser() {
    const elem = document.activeElement as HTMLDivElement;
    if (elem) elem.blur();
  }

  login() {
    this.loading.set(true);
    this.accountService.login(this.creds).subscribe({
      next: () => {
        this.router.navigateByUrl('/members');
        this.toast.success('Login successfully!');
        this.creds = {};
      },

      error: (err) => {
        const errors = err.error?.errors;

        // Case 1: errors is an object like { Email: [], Password: [] }
        if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
          const messages: string[] = [];

          Object.keys(errors).forEach((key) => {
            const arr = errors[key];
            if (Array.isArray(arr)) {
              arr.forEach((msg) => messages.push(msg));
            }
          });

          this.toast.error(messages.join('<br/>'));
          return;
        }

        // Case 2: Single message
        if (err?.error) {
          this.toast.error(err.error);
          return;
        }
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }
  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
