import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent, SidebarComponent } from '@components';
import { AuthService, UsersApiService } from '@shared/services';
import { LucideAngularModule, Plus, Trash2, User } from 'lucide-angular';

interface UserItem {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, HeaderComponent, SidebarComponent, LucideAngularModule],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users: UserItem[] = [];
  loading = false;
  error = '';
  showAddModal = false;
  newUsername = '';
  newPassword = '';
  newRole: 'Operator' | 'Engineer' | 'Supervisor' = 'Operator';

  plus = Plus;
  trash2 = Trash2;
  user = User;

  constructor(
    private api: UsersApiService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.api.getAll().subscribe({
      next: (list) => {
        this.users = list.map((u) => ({
          id: u.id,
          username: u.username,
          role: this.roleLabel(u.role),
          createdAt: new Date(u.createdAt).toLocaleDateString(),
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'Failed to load users.';
        this.loading = false;
      },
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.newUsername = '';
    this.newPassword = '';
    this.newRole = 'Operator';
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  addUser(): void {
    if (!this.newUsername.trim() || !this.newPassword) return;

    this.api.create(this.newUsername.trim(), this.newPassword, this.newRole).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadUsers();
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'Failed to create user.';
      },
    });
  }

  private roleLabel(role: number | string): string {
    if (typeof role === 'string') return role;
    return role === 0 ? 'Operator' : role === 1 ? 'Engineer' : 'Supervisor';
  }

  deleteUser(id: string): void {
    if (!confirm('Delete this user?')) return;

    this.api.delete(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        this.error = err?.error?.error ?? 'Failed to delete user.';
      },
    });
  }
}
