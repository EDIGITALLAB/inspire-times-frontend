import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupPage {
  userData = {
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'AUTHOR'
  };
  error = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSignup() {
    this.isLoading = true;
    this.error = '';
    this.authService.signup(this.userData).subscribe({
      next: () => {
        alert('Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error || 'Failed to register. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
