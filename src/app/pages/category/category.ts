import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    public articleService: ArticleService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryName = params['name'];
      this.fetchArticles();
    });
  }

  fetchArticles() {
    this.isLoading = true;
    this.articleService.getArticlesByCategory(this.categoryName).subscribe({
      next: (data) => {
        this.articles = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching articles by category', err);
        this.isLoading = false;
      }
    });
  }

  getImageUrl(url: string) {
    return this.articleService.getImageUrl(url);
  }
}
