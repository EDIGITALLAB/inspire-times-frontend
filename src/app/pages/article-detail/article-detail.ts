import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ArticleService } from '../../services/article.service';
import { TrendingArticles } from '../../components/trending-articles/trending-articles';
import { CommentsSection } from '../../components/comments-section/comments-section';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TrendingArticles, CommentsSection],
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
      const description = this.article.metaDescription || this.article.subtitle || (this.article.content || '').substring(0, 160);

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

  getReadTime(article: any): number {
    return this.articleService.getReadTime(article);
  }

  showCopiedMsg = false;
  subscribedSidebar = false;

  subscribeSidebar(email: string) {
    if (email && email.trim()) {
      this.subscribedSidebar = true;
      this.cdr.detectChanges();
    }
  }

  getFacebookShareUrl(): string {
    if (typeof window !== 'undefined') {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    }
    return '#';
  }

  getTwitterShareUrl(): string {
    if (typeof window !== 'undefined') {
      const text = this.article ? `${this.article.title} - Inspire Times` : 'Inspire Times';
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    }
    return '#';
  }

  getWhatsappShareUrl(): string {
    if (typeof window !== 'undefined') {
      const text = this.article ? `${this.article.title} - ` : '';
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(text + window.location.href)}`;
    }
    return '#';
  }

  copyLink() {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          this.triggerCopyFeedback();
        }).catch(err => {
          console.warn('Navigator clipboard failed, trying fallback: ', err);
          this.copyToClipboardFallback(url);
        });
      } else {
        this.copyToClipboardFallback(url);
      }
    }
  }

  private copyToClipboardFallback(text: string) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        this.triggerCopyFeedback();
      } else {
        console.error('Fallback copy command was unsuccessful');
      }
    } catch (err) {
      console.error('Fallback: Unable to copy', err);
    }
  }

  private triggerCopyFeedback() {
    this.showCopiedMsg = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showCopiedMsg = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
