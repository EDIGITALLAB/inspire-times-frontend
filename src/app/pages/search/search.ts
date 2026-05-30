import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class SearchPage implements OnInit {
  searchQuery: string = '';
  articles: any[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    public articleService: ArticleService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.performSearch();
      } else {
        this.loadAllArticles();
      }
    });
  }

  loadAllArticles() {
    this.isLoading = true;
    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        this.articles = [...data].sort((a, b) => b.id - a.id);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading all articles', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  performSearch() {
    this.isLoading = true;
    this.articleService.searchArticles(this.searchQuery).subscribe({
      next: (data) => {
        this.articles = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error performing search', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getImageUrl(url: string) {
    return this.articleService.getImageUrl(url);
  }
}
