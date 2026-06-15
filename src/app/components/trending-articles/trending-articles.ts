import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../services/article.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-trending-articles',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trending-articles.html',
  styleUrl: './trending-articles.css',
})
export class TrendingArticles implements OnInit {
  trendingArticles: any[] = [];
  isLoading = true;

  constructor(
    private articleService: ArticleService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchTrendingArticles();
  }

  fetchTrendingArticles() {
    this.articleService.getTrendingArticles()
      .subscribe({
        next: (data) => {
          this.trendingArticles = data.slice(0, 5);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching trending articles', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onCardClick(event: MouseEvent, slugOrId: string) {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      return;
    }
    this.router.navigate(['/article', slugOrId]);
  }

  getImageUrl(url: string) {
    return this.articleService.getImageUrl(url);
  }
}
