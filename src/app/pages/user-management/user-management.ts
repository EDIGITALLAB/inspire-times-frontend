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

  loadUsers(showSpinner = true) {
    if (showSpinner) {
      this.isLoading = true;
    }
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
      // Optimistic delete: remove from UI immediately
      const deletedUserIndex = this.users.findIndex(u => u.id === id);
      let deletedUser: any = null;
      if (deletedUserIndex > -1) {
        deletedUser = this.users[deletedUserIndex];
        this.users.splice(deletedUserIndex, 1);
        this.cdr.detectChanges();
      }

      this.authService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers(false); // Quietly sync with server
        },
        error: (err) => {
          // Revert delete on error
          if (deletedUserIndex > -1 && deletedUser) {
            this.users.splice(deletedUserIndex, 0, deletedUser);
            this.cdr.detectChanges();
          }
          alert("Failed to delete user on the server.");
        }
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
    
    // Optimistic UI Update: update the local user role immediately
    const userToUpdate = this.users.find(u => u.id === id);
    if (userToUpdate) {
      userToUpdate.role = newRole;
      this.cdr.detectChanges();
    }

    this.authService.updateUserRole(id, newRole).subscribe({
      next: () => {
        this.loadUsers(false); // Quietly sync with server
      },
      error: (err) => {
        // Revert local changes on failure
        if (userToUpdate) {
          userToUpdate.role = currentRole;
          this.cdr.detectChanges();
        }
        alert("Failed to update user role on the server.");
      }
    });
  }
}
