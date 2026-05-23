import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPage {
  credentials = {
    username: '',
    password: ''
  };
  error = '';
  isLoading = false;
  returnUrl: string = '/admin';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
  }

  onLogin() {
    this.isLoading = true;
    this.error = '';
    this.authService.login(this.credentials).subscribe({
      next: (user) => {
        if (user.role === 'ADMIN') {
          this.error = 'Please use the Staff Login page for Admin access.';
          this.authService.logout();
          this.isLoading = false;
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (err) => {
        this.error = err.error?.error || err.error?.message || 'Invalid username or password';
        this.isLoading = false;
      }
    });
  }
}
