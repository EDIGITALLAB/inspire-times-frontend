import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLoginPage {
  credentials = {
    username: '',
    password: ''
  };
  error = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin() {
    this.isLoading = true;
    this.error = '';
    this.authService.login(this.credentials).subscribe({
      next: (user) => {
        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.error = 'Access Denied: You are not an Admin.';
          this.authService.logout();
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.error = err.error?.error || err.error?.message || 'Invalid credentials';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
