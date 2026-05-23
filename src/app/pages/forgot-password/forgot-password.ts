import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordPage {
  email = '';
  message = '';
  error = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.isLoading = true;
    this.message = '';
    this.error = '';

    this.http.post('http://localhost:8080/api/auth/forgot-password', { email: this.email })
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
