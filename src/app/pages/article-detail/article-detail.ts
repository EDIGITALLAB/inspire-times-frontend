import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';
import { BookmarkService } from '../../services/bookmark.service';
import { RelatedArticles } from '../../components/related-articles/related-articles';
import { CommentsSection } from '../../components/comments-section/comments-section';
import { HostListener } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, RelatedArticles, CommentsSection],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.css',
})
export class ArticleDetail implements OnInit {
  article: any = null;
  isLoading = true;
  isBookmarked = false;

  // General Toast State
  showToast = false;
  toastMessage = '';
  toastIcon = 'fa-solid fa-circle-check text-success';

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
    private authService: AuthService,
    private bookmarkService: BookmarkService,
    private router: Router,
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
          this.checkBookmarkStatus();
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

  checkBookmarkStatus() {
    if (this.authService.isLoggedIn() && this.article && this.article.id) {
      this.bookmarkService.checkBookmark(this.article.id).subscribe({
        next: (status) => {
          this.isBookmarked = status;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error checking bookmark status', err)
      });
    }
  }

  toggleBookmark() {
    if (!this.authService.isLoggedIn()) {
      this.triggerToast('Please login to bookmark articles!', 'fa-solid fa-circle-exclamation text-warning');
      setTimeout(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      }, 1500);
      return;
    }

    if (!this.article || !this.article.id) return;

    if (this.isBookmarked) {
      this.bookmarkService.removeBookmark(this.article.id).subscribe({
        next: () => {
          this.isBookmarked = false;
          this.triggerToast('Removed from Bookmarks', 'fa-solid fa-circle-check text-success');
        },
        error: (err) => {
          console.error('Error removing bookmark', err);
          this.triggerToast('Failed to remove bookmark', 'fa-solid fa-circle-xmark text-danger');
        }
      });
    } else {
      this.bookmarkService.addBookmark(this.article.id).subscribe({
        next: () => {
          this.isBookmarked = true;
          this.triggerToast('Saved to Bookmarks', 'fa-solid fa-bookmark text-success');
        },
        error: (err) => {
          console.error('Error adding bookmark', err);
          this.triggerToast('Failed to save bookmark', 'fa-solid fa-circle-xmark text-danger');
        }
      });
    }
  }

  updateSEOTags() {
    if (this.article) {
      const title = this.article.metaTitle || `${this.article.title} | Inspire Times`;
      const description = this.article.metaDescription || this.article.subtitle || (this.article.content || '').substring(0, 160);
      const imageUrl = this.getImageUrl(this.article.imageUrl);
      const url = typeof window !== 'undefined' ? window.location.href : `https://inspiretimes.in/article/${this.article.slug}`;

      this.titleService.setTitle(title);
      this.metaService.updateTag({ name: 'description', content: description });

      if (this.article.metaKeywords) {
        this.metaService.updateTag({ name: 'keywords', content: this.article.metaKeywords });
      }

      // Open Graph / Facebook Tags
      this.metaService.updateTag({ property: 'og:title', content: title });
      this.metaService.updateTag({ property: 'og:description', content: description });
      this.metaService.updateTag({ property: 'og:image', content: imageUrl });
      this.metaService.updateTag({ property: 'og:type', content: 'article' });
      this.metaService.updateTag({ property: 'og:url', content: url });
      this.metaService.updateTag({ property: 'og:site_name', content: 'Inspire Times' });

      // Article specific OG tags
      if (this.article.publishedAt) {
        try {
          const pubDate = new Date(this.article.publishedAt).toISOString();
          this.metaService.updateTag({ property: 'article:published_time', content: pubDate });
        } catch (e) {
          console.warn('Error formatting publishedAt date', e);
        }
      }
      if (this.article.author) {
        this.metaService.updateTag({ property: 'article:author', content: this.article.author });
      }
      if (this.article.category) {
        this.metaService.updateTag({ property: 'article:section', content: this.article.category });
      }

      // Twitter Card Tags
      this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.metaService.updateTag({ name: 'twitter:title', content: title });
      this.metaService.updateTag({ name: 'twitter:description', content: description });
      this.metaService.updateTag({ name: 'twitter:image', content: imageUrl });
      this.metaService.updateTag({ name: 'twitter:url', content: url });
    }
  }

  getImageUrl(url: string) {
    return this.articleService.getImageUrl(url);
  }

  getReadTime(article: any): number {
    return this.articleService.getReadTime(article);
  }

  subscribedSidebar = false;

  subscribeSidebar(email: string) {
    if (email && email.trim()) {
      this.subscribedSidebar = true;
      this.cdr.detectChanges();
    }
  }

  getFacebookShareUrl(): string {
    if (this.article && typeof window !== 'undefined') {
      const shareUrl = `${API_CONFIG.apiUrl}/articles/share/${this.article.slug}`;
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    }
    return '#';
  }

  getTwitterShareUrl(): string {
    if (this.article && typeof window !== 'undefined') {
      const shareUrl = `${API_CONFIG.apiUrl}/articles/share/${this.article.slug}`;
      const text = `${this.article.title} - Inspire Times`;
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    }
    return '#';
  }

  getWhatsappShareUrl(): string {
    if (this.article && typeof window !== 'undefined') {
      const shareUrl = `${API_CONFIG.apiUrl}/articles/share/${this.article.slug}`;
      const text = `${this.article.title} - `;
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(text + shareUrl)}`;
    }
    return '#';
  }

  copyLink() {
    if (this.article && typeof window !== 'undefined') {
      const shareUrl = `${API_CONFIG.apiUrl}/articles/share/${this.article.slug}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          this.triggerCopyFeedback();
        }).catch(err => {
          console.warn('Navigator clipboard failed, trying fallback: ', err);
          this.copyToClipboardFallback(shareUrl);
        });
      } else {
        this.copyToClipboardFallback(shareUrl);
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
    this.triggerToast('Link copied to clipboard!', 'fa-solid fa-circle-check text-success');
  }

  triggerToast(message: string, iconClass: string = 'fa-solid fa-circle-check text-success') {
    this.toastMessage = message;
    this.toastIcon = iconClass;
    this.showToast = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}

