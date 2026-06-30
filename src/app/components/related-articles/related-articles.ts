import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../services/article.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-related-articles',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './related-articles.html',
  styleUrl: './related-articles.css',
})
export class RelatedArticles implements OnInit, OnChanges {
  @Input() category: string = '';
  @Input() currentArticleId: any = null;

  relatedArticles: any[] = [];
  isLoading = true;

  constructor(
    private articleService: ArticleService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchRelatedArticles();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['category'] || changes['currentArticleId']) {
      this.fetchRelatedArticles();
    }
  }

  fetchRelatedArticles() {
    if (!this.category) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    
    // Step 1: Fetch articles in the same category
    this.articleService.getArticlesByCategory(this.category)
      .subscribe({
        next: (categoryData) => {
          // Filter out the current article
          let categoryArticles = categoryData.filter(art => art.id !== this.currentArticleId);
          
          if (categoryArticles.length >= 10) {
            this.relatedArticles = categoryArticles.slice(0, 10);
            this.isLoading = false;
            this.cdr.detectChanges();
          } else {
            // Step 2: If we have less than 10, fetch all articles to fill the rest
            this.articleService.getAllArticles().subscribe({
              next: (allData) => {
                // Filter out current article and any that are already in categoryArticles
                const categoryIds = new Set(categoryArticles.map(art => art.id));
                let extraArticles = allData.filter(art => 
                  art.id !== this.currentArticleId && !categoryIds.has(art.id)
                );
                
                // Combine them
                this.relatedArticles = [...categoryArticles, ...extraArticles].slice(0, 10);
                this.isLoading = false;
                this.cdr.detectChanges();
              },
              error: (err) => {
                console.error('Error fetching fallback articles', err);
                this.relatedArticles = categoryArticles.slice(0, 10);
                this.isLoading = false;
                this.cdr.detectChanges();
              }
            });
          }
        },
        error: (err) => {
          console.error('Error fetching related articles by category', err);
          // Try to fallback to all articles directly
          this.articleService.getAllArticles().subscribe({
            next: (allData) => {
              this.relatedArticles = allData
                .filter(art => art.id !== this.currentArticleId)
                .slice(0, 10);
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: () => {
              this.relatedArticles = [];
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
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
