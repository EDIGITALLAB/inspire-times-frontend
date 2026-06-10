import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { API_CONFIG } from '../../config/api.config';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordPage implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  message = '';
  error = '';
  isLoading = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordPattern.test(this.password)) {
      this.error = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.';
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.error = '';

    const payload = {
      token: this.token,
      password: this.password
    };

    this.http.post(`${API_CONFIG.apiUrl}/auth/reset-password`, payload)
      .subscribe({
        next: (res: any) => {
          this.message = res.message;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.error = err.error?.error || err.error?.message || 'Something went wrong. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
}
