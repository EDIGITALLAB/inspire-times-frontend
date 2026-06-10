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
  currentPage = 1;
  pageSize = 6;

  constructor(
    private route: ActivatedRoute,
    public articleService: ArticleService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.currentPage = 1; // Reset to page 1 on query changes
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
        const maxPage = Math.ceil(this.articles.length / this.pageSize) || 1;
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
        }
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
        const maxPage = Math.ceil(this.articles.length / this.pageSize) || 1;
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
        }
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

  getReadTime(article: any): number {
    return this.articleService.getReadTime(article);
  }

  get paginatedArticles() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.articles.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.articles.length / this.pageSize);
  }

  get pages() {
    const pagesArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }
}
