import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupPage implements OnInit {
  userData = {
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'AUTHOR'
  };
  error = '';
  isLoading = false;
  returnUrl = '/admin';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSignup() {
    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordPattern.test(this.userData.password)) {
      this.error = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.authService.signup(this.userData).subscribe({
      next: () => {
        alert('Registration successful! Please login.');
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl } });
      },
      error: (err) => {
        this.error = err.error || 'Failed to register. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
