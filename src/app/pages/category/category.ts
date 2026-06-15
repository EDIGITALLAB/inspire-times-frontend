import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class CategoryPage implements OnInit {
  categoryName: string = '';
  articles: any[] = [];
  isLoading = true;
  currentPage = 1;
  pageSize = 6;

  constructor(
    private route: ActivatedRoute,
    public articleService: ArticleService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryName = params['name'];
      this.currentPage = 1; // Reset to page 1 on category change
      this.fetchArticles();
    });
  }

  fetchArticles() {
    this.isLoading = true;
    this.articleService.getArticlesByCategory(this.categoryName).subscribe({
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
        console.error('Error fetching articles by category', err);
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
