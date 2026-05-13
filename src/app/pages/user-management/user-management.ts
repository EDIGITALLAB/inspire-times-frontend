import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {
  users: any[] = [];
  isLoading = true;
  error = '';

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.error = '';
    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // Trigger UI update
      },
      error: (err) => {
        this.error = 'Failed to load users. Are you an Admin?';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  changeRole(id: number, currentRole: string) {
    const currentUser = this.authService.getCurrentUser();
    
    // Prevent self-role change to avoid lockout
    if (currentUser && currentUser.username === this.users.find(u => u.id === id)?.username) {
      alert("Security Alert: You cannot change your own role to avoid getting locked out of the Admin panel.");
      return;
    }

    const newRole = currentRole === 'ADMIN' ? 'AUTHOR' : 'ADMIN';
    this.authService.updateUserRole(id, newRole).subscribe(() => {
      this.loadUsers();
    });
  }
}
