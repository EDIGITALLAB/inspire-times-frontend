import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  isLoading = true;
  private scrollInterval: any;

  constructor(
    private articleService: ArticleService,
    private cdr: ChangeDetectorRef
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

          this.featuredArticle = allSorted.find(a => a.sectionType === 'FEATURED')
            || allSorted.find(a => a.sectionType !== 'LEFT_SECTION');

          // Latest Stories will show ALL articles, latest first
          this.latestStories = allSorted;

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

  getImageUrl(url: string) {
    return this.articleService.getImageUrl(url);
  }
}


