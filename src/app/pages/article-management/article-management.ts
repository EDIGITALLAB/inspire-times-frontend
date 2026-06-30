import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-article-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './article-management.html',
  styleUrl: './article-management.css'
})
export class ArticleManagement implements OnInit, OnDestroy {
  articles: any[] = [];
  userRole = '';
  currentPage = 1;
  pageSize = 10;
  activeFilter = 'ALL';
  checkingPlagiarism: { [key: number]: boolean } = {};
  activePolls: { [key: number]: any } = {};
  showRejectPrompt = false;
  rejectingArticleId: number | null = null;
  rejectionInputReason = '';
  predefinedReasons = [
    { label: 'Plagiarism', text: 'High plagiarism percentage detected in the content.' },
    { label: 'Inappropriate Content', text: 'Inappropriate language or offensive content.' },
    { label: 'Grammar/Format', text: 'Poor grammar, formatting, or spelling errors.' },
    { label: 'Misleading Info', text: 'Incorrect facts or misleading information.' },
    { label: 'Duplicate/Off-Topic', text: 'The article is off-topic, duplicate, or does not meet publishing guidelines.' }
  ];

  constructor(
    public articleService: ArticleService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.userRole = this.authService.getCurrentUser()?.role;
  }

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    const observable = this.userRole === 'ADMIN' 
      ? this.articleService.getAllArticlesAdmin() 
      : this.articleService.getMyArticles();

    observable.subscribe({
      next: (data) => {
        this.articles = data;
        const maxPage = Math.ceil(this.filteredArticles.length / this.pageSize) || 1;
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
        }
        
        // Auto-resume polling for any articles that are currently in-progress (-1)
        if (this.userRole === 'ADMIN') {
          this.articles.forEach(art => {
            if (art.plagiarismPercentage === -1) {
              this.startPolling(art.id);
            }
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading articles', err)
    });
  }

  get filteredArticles() {
    if (this.activeFilter === 'ALL') {
      return this.articles;
    }
    return this.articles.filter(a => a.status === this.activeFilter);
  }

  get paginatedArticles() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredArticles.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredArticles.length / this.pageSize);
  }

  get pages() {
    const pagesArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  getPendingCount(): number {
    return this.articles.filter(a => a.status === 'PENDING').length;
  }

  getApprovedCount(): number {
    return this.articles.filter(a => a.status === 'APPROVED').length;
  }

  getRejectedCount(): number {
    return this.articles.filter(a => a.status === 'REJECTED').length;
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  approveArticle(id: number) {
    if (confirm('Are you sure you want to approve and publish this article?')) {
      this.articleService.approveArticle(id).subscribe({
        next: () => {
          this.loadArticles();
          alert('Article approved successfully!');
        },
        error: (err) => console.error('Error approving article', err)
      });
    }
  }

  rejectArticle(id: number) {
    this.rejectingArticleId = id;
    this.showRejectPrompt = true;
    this.cdr.detectChanges();
  }

  selectPredefinedReason(text: string) {
    this.rejectionInputReason = text;
    this.cdr.detectChanges();
  }

  submitRejection() {
    const reason = this.rejectionInputReason;
    if (!reason || !reason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    if (this.rejectingArticleId !== null) {
      this.articleService.rejectArticle(this.rejectingArticleId, reason.trim()).subscribe({
        next: () => {
          this.loadArticles();
          this.closeRejectPrompt();
          alert('Article rejected successfully.');
        },
        error: (err) => {
          console.error('Error rejecting article', err);
          alert('Failed to reject article. Please try again.');
        }
      });
    }
  }

  closeRejectPrompt() {
    this.showRejectPrompt = false;
    this.rejectingArticleId = null;
    this.rejectionInputReason = '';
    this.cdr.detectChanges();
  }

  deleteArticle(id: number) {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.loadArticles();
          alert('Article deleted successfully');
        },
        error: (err) => console.error('Error deleting article', err)
      });
    }
  }

  selectedRejectionReason: string | null = null;

  showReason(reason: string) {
    if (reason) {
      this.selectedRejectionReason = reason;
      this.cdr.detectChanges();
    }
  }

  closeRejectionModal() {
    this.selectedRejectionReason = null;
    this.cdr.detectChanges();
  }

  runPlagiarismCheck(id: number) {
    this.checkingPlagiarism[id] = true;
    this.cdr.detectChanges();
    this.articleService.checkPlagiarism(id).subscribe({
      next: (updatedArticle) => {
        this.checkingPlagiarism[id] = false;
        const index = this.articles.findIndex(a => a.id === id);
        if (index !== -1) {
          this.articles[index] = updatedArticle;
        }
        this.cdr.detectChanges();
        
        // Start polling for updates for this article
        this.startPolling(id);
      },
      error: (err) => {
        this.checkingPlagiarism[id] = false;
        console.error('Error running plagiarism check', err);
        const errMsg = err.error?.error || err.message || 'Unknown error occurred.';
        alert(`Failed to start plagiarism check: ${errMsg}`);
        this.cdr.detectChanges();
      }
    });
  }

  startPolling(id: number) {
    // If there is already an active poll for this article, clear it first
    if (this.activePolls[id]) {
      clearInterval(this.activePolls[id]);
    }

    let attempts = 0;
    const intervalId = setInterval(() => {
      attempts++;
      
      // Stop polling after 15 attempts (75 seconds) to avoid infinite polling on error
      if (attempts > 15) {
        clearInterval(intervalId);
        delete this.activePolls[id];
        const index = this.articles.findIndex(a => a.id === id);
        if (index !== -1 && this.articles[index].plagiarismPercentage === -1) {
          this.articles[index].plagiarismPercentage = null;
          alert('Plagiarism check timed out on backend.');
        }
        this.cdr.detectChanges();
        return;
      }

      this.articleService.getArticleById(id.toString()).subscribe({
        next: (article) => {
          if (article && article.plagiarismPercentage !== -1) {
            // Check completed (either null/N/A, 0%, or >0%, or errors)
            clearInterval(intervalId);
            delete this.activePolls[id];

            const index = this.articles.findIndex(a => a.id === id);
            if (index !== -1) {
              this.articles[index] = article;
            }
            if (article.plagiarismPercentage === -2) {
              alert('Plagiarism check failed: Free API limit has been reached.');
            } else if (article.plagiarismPercentage === -3) {
              alert('Plagiarism check failed due to a server error.');
            } else {
              alert(`Plagiarism Check completed! Score: ${article.plagiarismPercentage != null ? article.plagiarismPercentage + '%' : 'N/A'}`);
            }
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error polling article status', err);
        }
      });
    }, 5000); // Check every 5 seconds

    this.activePolls[id] = intervalId;
  }

  ngOnDestroy() {
    // Clear all active polls when navigating away
    Object.keys(this.activePolls).forEach(id => {
      clearInterval(this.activePolls[+id]);
    });
  }
}
