import { Component, OnInit } from '@angular/core';
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
  }

  onSignup() {
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
      }
    });
  }
}
