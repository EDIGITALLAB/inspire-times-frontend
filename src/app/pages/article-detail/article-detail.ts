import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ArticleService } from '../../services/article.service';
import { TrendingArticles } from '../../components/trending-articles/trending-articles';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TrendingArticles],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.css',
})
export class ArticleDetail implements OnInit {
  article: any = null;
  isLoading = true;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    }
  }

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private cdr: ChangeDetectorRef,
    private titleService: Title,
    private metaService: Meta,
    private location: Location
  ) { }

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchArticle(slug);
      }
    });
  }

  fetchArticle(slug: string) {
    this.isLoading = true;
    this.articleService.getArticleBySlug(slug)
      .subscribe({
        next: (data) => {
          this.article = data;
          this.isLoading = false;
          this.updateSEOTags();
          this.cdr.detectChanges();

          // Increment view count
          if (this.article.id) {
            this.articleService.incrementViewCount(this.article.id).subscribe();
          }
        },
        error: (err) => {
          console.error('Error fetching article', err);
          this.isLoading = false;
          this.article = null;
          this.cdr.detectChanges();
        }
      });
  }

  updateSEOTags() {
    if (this.article) {
      const title = this.article.metaTitle || `${this.article.title} | Inspire Times`;
      const description = this.article.metaDescription || this.article.subtitle || this.article.content.substring(0, 160);

      this.titleService.setTitle(title);
      this.metaService.updateTag({ name: 'description', content: description });

      if (this.article.metaKeywords) {
        this.metaService.updateTag({ name: 'keywords', content: this.article.metaKeywords });
      }

      this.metaService.updateTag({ property: 'og:title', content: title });
      this.metaService.updateTag({ property: 'og:description', content: description });
      this.metaService.updateTag({ property: 'og:image', content: this.getImageUrl(this.article.imageUrl) });
      this.metaService.updateTag({ property: 'og:type', content: 'article' });
    }
  }

  getImageUrl(url: string) {
    return this.articleService.getImageUrl(url);
  }
}
