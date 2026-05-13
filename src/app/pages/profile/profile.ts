import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfilePage implements OnInit {
  user: any = {};
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = { ...currentUser };
    }
  }

  updateProfile() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // In a real app, this would call a backend API
    this.authService.updateProfile(this.user).subscribe({
      next: (updatedUser) => {
        this.successMessage = 'Profile updated successfully!';
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.changePassword(this.passwordData).subscribe({
      next: () => {
        this.successMessage = 'Password changed successfully!';
        this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to change password. Ensure current password is correct.';
        this.isLoading = false;
      }
    });
  }
}
