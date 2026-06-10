import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './error.html',
  styleUrl: './error.css'
})
export class ErrorPage implements OnInit {
  isChecking = false;
  statusMessage = '';

  constructor(
    private titleService: Title,
    private router: Router,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('System Error | Inspire Times');
  }

  retry() {
    this.isChecking = true;
    this.statusMessage = 'Checking connection to server...';
    
    // Attempt to fetch articles as a health check
    this.articleService.getAllArticles().subscribe({
      next: () => {
        this.statusMessage = 'Connection restored! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: () => {
        setTimeout(() => {
          this.isChecking = false;
          this.statusMessage = 'Server is still unreachable. Please try again in a few moments.';
        }, 1000);
      }
    });
  }
}
