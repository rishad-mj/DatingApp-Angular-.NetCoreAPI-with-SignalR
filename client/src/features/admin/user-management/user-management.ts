import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AdminService } from '../../../core/services/admin-service';
import { User } from '../../../Types/user';
import { HasRole } from '../../../shared/directives/has-role';

@Component({
  selector: 'app-user-management',
  imports: [HasRole],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  @ViewChild('rolesModal') rolesModal!: ElementRef<HTMLDialogElement>;
  private adminService = inject(AdminService);
  protected users = signal<User[]>([]);
  protected availableRoles = ['Member', 'Moderator', 'Admin'];
  protected selectedUser: User | null = null;

  ngOnInit(): void {
    this.getUserWithRoles();
  }

  getUserWithRoles() {
    this.adminService.getUserwithRoles().subscribe({ next: (users) => this.users.set(users) });
  }

  toggleRole(event: Event, role: string) {
    if (!this.selectedUser) return;

    if ((event.target as HTMLInputElement).checked) this.selectedUser.roles.push(role);
    else this.selectedUser.roles = this.selectedUser.roles.filter((r) => r !== role);
  }

  updateRoles() {
  if (!this.selectedUser) return;
  this.adminService.updateUserRoles(this.selectedUser.id, this.selectedUser.roles).subscribe({
    next: updateRoles=>{
      this.users.update(users=> users.map(u=>{
        if(u.id === this.selectedUser?.id) u.roles =updateRoles;
        return u;
      }));

      this.rolesModal.nativeElement.close();
    },
    error: err => console.log('Fialed to update roles')
  })

  }

  openRolesModal(user: User) {
    this.selectedUser = user;
    this.rolesModal.nativeElement.showModal();
  }
}
