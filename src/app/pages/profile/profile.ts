import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ArticleService } from '../../services/article.service';
import { BookmarkService } from '../../services/bookmark.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfilePage implements OnInit {
  user: any = {};
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  articleCount = 0;
  totalViews = '0';

  // Bookmark Properties
  bookmarks: any[] = [];
  isLoadingBookmarks = false;

  constructor(
    private authService: AuthService,
    private articleService: ArticleService,
    private bookmarkService: BookmarkService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = { ...currentUser };
      this.loadUserStats();
      this.loadBookmarks();
    }
  }

  loadBookmarks() {
    this.isLoadingBookmarks = true;
    this.bookmarkService.getBookmarks().subscribe({
      next: (data) => {
        this.bookmarks = data;
        this.isLoadingBookmarks = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading bookmarks', err);
        this.isLoadingBookmarks = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeBookmark(articleId: number, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.bookmarkService.removeBookmark(articleId).subscribe({
      next: () => {
        this.bookmarks = this.bookmarks.filter(b => b.article.id !== articleId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error removing bookmark', err);
      }
    });
  }

  getImageUrl(url: string): string {
    return this.articleService.getImageUrl(url);
  }

  loadUserStats() {
    this.articleService.getMyArticles().subscribe({
      next: (articles) => {
        this.articleCount = articles.length;
        const total = articles.reduce((sum, art) => sum + (art.viewCount || 0), 0);
        this.totalViews = this.formatNumber(total);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading user stats', err)
    });
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  }

  updateProfile() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.updateProfile(this.user).subscribe({
      next: (updatedUser) => {
        this.successMessage = 'Profile updated successfully!';
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      }
    });
  }

  changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.errorMessage = '';
        this.cdr.detectChanges();
      }, 3000);
      return;
    }

    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordPattern.test(this.passwordData.newPassword)) {
      this.errorMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.errorMessage = '';
        this.cdr.detectChanges();
      }, 3000);
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.changePassword(this.passwordData).subscribe({
      next: () => {
        this.successMessage = 'Password changed successfully!';
        this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to change password. Ensure current password is correct.';
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      }
    });
  }
}
