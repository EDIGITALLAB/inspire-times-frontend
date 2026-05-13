import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-article-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article-management.html',
  styleUrl: './article-management.css'
})
export class ArticleManagement implements OnInit {
  articles: any[] = [];
  userRole = '';

  constructor(
    public articleService: ArticleService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.userRole = this.authService.getCurrentUser()?.role;
  }

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    const observable = this.userRole === 'ADMIN' 
      ? this.articleService.getAllArticles() 
      : this.articleService.getMyArticles();

    observable.subscribe({
      next: (data) => {
        this.articles = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading articles', err)
    });
  }

  deleteArticle(id: number) {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.loadArticles();
          alert('Article deleted successfully');
        },
        error: (err) => console.error('Error deleting article', err)
      });
    }
  }
}
