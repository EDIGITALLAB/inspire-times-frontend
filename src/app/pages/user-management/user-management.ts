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
  currentPage = 1;
  pageSize = 10;

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
        const maxPage = Math.ceil(this.users.length / this.pageSize) || 1;
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
        }
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

  toggleStatus(id: number) {
    const currentUser = this.authService.getCurrentUser();
    const userToUpdate = this.users.find(u => u.id === id);
    
    // Prevent disabling oneself to avoid lockout
    if (currentUser && userToUpdate && currentUser.username === userToUpdate.username) {
      alert("Security Alert: You cannot disable your own admin account.");
      return;
    }

    const currentStatus = userToUpdate ? userToUpdate.enabled : true;
    const newStatus = currentStatus === false ? true : false;

    const actionText = newStatus ? 'enable' : 'disable';
    if (!confirm(`Are you sure you want to ${actionText} this user?`)) {
      return;
    }

    // Optimistic UI Update
    if (userToUpdate) {
      userToUpdate.enabled = newStatus;
      this.cdr.detectChanges();
    }

    this.authService.toggleUserStatus(id).subscribe({
      next: () => {
        this.loadUsers(false); // Quietly sync with server
      },
      error: (err) => {
        // Revert local changes on failure
        if (userToUpdate) {
          userToUpdate.enabled = currentStatus;
          this.cdr.detectChanges();
        }
        alert(err.error?.error || "Failed to update user status on the server.");
      }
    });
  }

  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.users.length / this.pageSize);
  }

  get pages() {
    const pagesArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }
}
