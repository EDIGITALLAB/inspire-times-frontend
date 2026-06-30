import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';

import { TrendingArticles } from '../../components/trending-articles/trending-articles';
import { TrendingTicker } from '../../components/trending-ticker/trending-ticker';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TrendingArticles, TrendingTicker, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  latestStories: any[] = [];
  featuredArticle: any = null;
  leftSectionArticles: any[] = [];
  editorsPickArticle: any = null;
  popularCategories: any[] = [];
  isLoading = true;
  activeCategoryIndex = 0;
  categoryDots = Array(7).fill(0);
  activeStoryIndex = 0;
  private scrollInterval: any;

  constructor(
    private articleService: ArticleService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchArticles();
    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  startAutoScroll() {
    this.scrollInterval = setInterval(() => {
      this.scrollStories(1);
    }, 4000); // Scroll every 4 seconds
  }

  stopAutoScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  fetchArticles() {
    this.articleService.getAllArticles()
      .subscribe({
        next: (data) => {
          // Sort all articles by latest (ID descending)
          const allSorted = [...data].sort((a, b) => b.id - a.id);

          this.leftSectionArticles = allSorted.filter(a => a.sectionType === 'LEFT_SECTION').slice(0, 3);
          const leftIds = new Set(this.leftSectionArticles.map(a => a.id));

          this.featuredArticle = allSorted.find(a => a.sectionType === 'FEATURED');

          let editorsPick = allSorted.find(a => a.sectionType === 'EDITORS_PICK');
          if (!editorsPick) {
            // Find most viewed article in the last 7 days, excluding the featured article
            const now = new Date();
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);

            const weeklyArticles = data.filter(a => {
              if (!a.publishedAt) return false;
              const pubDate = new Date(a.publishedAt);
              return pubDate >= oneWeekAgo && pubDate <= now;
            });

            if (weeklyArticles.length > 0) {
              weeklyArticles.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
              editorsPick = weeklyArticles[0];
            } else {
              // Fallback: Find the absolute most viewed article from all articles
              const viewSorted = [...data].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
              editorsPick = viewSorted[0] || allSorted[0];
            }
          }
          this.editorsPickArticle = editorsPick;

          // Latest Stories will show a maximum of 10 articles, latest first
          this.latestStories = allSorted.slice(0, 10);

          // Compute category counts for popular categories
          const getCount = (catName: string) => data.filter(a => a.category?.toUpperCase() === catName.toUpperCase()).length;
          this.popularCategories = [
            { name: 'INSPIRATION', displayName: 'Inspiration', icon: 'fa-fire', count: getCount('INSPIRATION') },
            { name: 'HEALTH & FITNESS', displayName: 'Health & Fitness', icon: 'fa-heart-pulse', count: getCount('HEALTH & FITNESS') },
            { name: 'SPIRITUAL', displayName: 'Spiritual', icon: 'fa-dove', count: getCount('SPIRITUAL') },
            { name: 'TRAVEL', displayName: 'Travel', icon: 'fa-compass', count: getCount('TRAVEL') },
            { name: 'RELATIONSHIP', displayName: 'Relationship', icon: 'fa-heart', count: getCount('RELATIONSHIP') },
            { name: 'LIFESTYLE', displayName: 'Lifestyle', icon: 'fa-spa', count: getCount('LIFESTYLE') },
            { name: 'FASHION & BEAUTY', displayName: 'Fashion & Beauty', icon: 'fa-wand-magic-sparkles', count: getCount('FASHION & BEAUTY') },
            { name: 'PETS & ANIMALS', displayName: 'Pets & Animals', icon: 'fa-paw', count: getCount('PETS & ANIMALS') },
            { name: 'ENVIRONMENT', displayName: 'Environment', icon: 'fa-leaf', count: getCount('ENVIRONMENT') },
            { name: 'INNOVATION', displayName: 'Innovation', icon: 'fa-lightbulb', count: getCount('INNOVATION') },
            { name: 'TECHNOLOGY', displayName: 'Technology', icon: 'fa-laptop-code', count: getCount('TECHNOLOGY') },
            { name: 'AI', displayName: 'AI', icon: 'fa-robot', count: getCount('AI') },
            { name: 'EDUCATION', displayName: 'Education', icon: 'fa-graduation-cap', count: getCount('EDUCATION') },
            { name: 'FOOD & NUTRITION', displayName: 'Food & Nutrition', icon: 'fa-carrot', count: getCount('FOOD & NUTRITION') },
            { name: 'HEALTHY RECIPES', displayName: 'Healthy Recipes', icon: 'fa-utensils', count: getCount('HEALTHY RECIPES') },
            { name: 'CULTURE & HERITAGE', displayName: 'Culture & Heritage', icon: 'fa-landmark', count: getCount('CULTURE & HERITAGE') },
            { name: 'SOCIAL IMPACT', displayName: 'Social Impact', icon: 'fa-earth-americas', count: getCount('SOCIAL IMPACT') }
          ];

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching articles', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  scrollStories(direction: number) {
    const container = document.getElementById('latestStoriesContainer');
    if (container) {
      const card = container.querySelector('.story-item') as HTMLElement;
      const scrollAmount = card ? card.offsetWidth + 24 : 350;
      const isAtEnd = container.scrollLeft + container.offsetWidth >= container.scrollWidth - 10;

      if (direction === 1 && isAtEnd) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({
          left: direction * scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }

  scrollCategories(direction: number) {
    const container = document.getElementById('categoriesContainer');
    if (container) {
      const card = container.querySelector('.category-item') as HTMLElement;
      const scrollAmount = card ? card.offsetWidth + 16 : 250;
      container.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  onCategoriesScroll(event: Event) {
    const container = event.target as HTMLElement;
    if (container) {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      if (maxScrollLeft > 0) {
        const scrollPercent = container.scrollLeft / maxScrollLeft;
        this.activeCategoryIndex = Math.min(6, Math.max(0, Math.round(scrollPercent * 6)));
      } else {
        this.activeCategoryIndex = 0;
      }
    }
  }

  scrollToCategoryIndex(index: number) {
    const container = document.getElementById('categoriesContainer');
    if (container) {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const targetScrollLeft = (index / 6) * maxScrollLeft;
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
      this.activeCategoryIndex = index;
    }
  }

  onStoriesScroll(event: Event) {
    const container = event.target as HTMLElement;
    if (container) {
      const card = container.querySelector('.story-item') as HTMLElement;
      if (card) {
        const cardWidth = card.offsetWidth + 24;
        this.activeStoryIndex = Math.min(
          this.latestStories.length - 1,
          Math.max(0, Math.round(container.scrollLeft / cardWidth))
        );
      }
    }
  }

  scrollToStoryIndex(index: number) {
    const container = document.getElementById('latestStoriesContainer');
    if (container) {
      const card = container.querySelector('.story-item') as HTMLElement;
      if (card) {
        const cardWidth = card.offsetWidth + 24;
        container.scrollTo({
          left: index * cardWidth,
          behavior: 'smooth'
        });
        this.activeStoryIndex = index;
      }
    }
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

  getArticleExcerpt(article: any): string {
    if (!article) return '';
    if (article.content && article.content.trim().length > 0) {
      return article.content;
    }
    if (article.sections && article.sections.length > 0) {
      // Find the first paragraph section
      const firstParagraph = article.sections.find((s: any) => s.type === 'paragraph' && s.content && s.content.trim().length > 0);
      if (firstParagraph) {
        return firstParagraph.content;
      }
      // Fallback to any section with content
      const anyContent = article.sections.find((s: any) => s.content && s.content.trim().length > 0);
      if (anyContent) {
        return anyContent.content;
      }
    }
    return article.subtitle || '';
  }
}


