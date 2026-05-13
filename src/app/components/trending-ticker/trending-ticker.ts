import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../services/article.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trending-ticker',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trending-ticker.html',
  styleUrl: './trending-ticker.css',
})
export class TrendingTicker implements OnInit {
  trendingArticles: any[] = [];
  isLoading = true;

  constructor(
    private articleService: ArticleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchTrendingArticles();
  }

  fetchTrendingArticles() {
    this.articleService.getTrendingArticles()
      .subscribe({
        next: (data) => {
          this.trendingArticles = data.slice(0, 10);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching trending articles for ticker', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
}
