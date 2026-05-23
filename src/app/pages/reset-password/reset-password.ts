import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';

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
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.error = '';

    const payload = {
      token: this.token,
      password: this.password
    };

    this.http.post('http://localhost:8080/api/auth/reset-password', payload)
      .subscribe({
        next: (res: any) => {
          this.message = res.message;
          this.isLoading = false;
        },
        error: (err: any) => {
          this.error = err.error?.error || err.error?.message || 'Something went wrong. Please try again.';
          this.isLoading = false;
        }
      });
  }
}
