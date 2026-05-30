import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  isMenuOpen = false;
  isSearchOpen = false;
  isScrolled = false;
  searchQuery = '';
  currentUser: any = null;

  constructor(public router: Router, public authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.isMenuOpen = false;
  }

  categories = [
    'Inspiration',
    'Health & Fitness',
    'Spiritual',
    'Travel',
    'Relationship',
    'Lifestyle',
    'Fashion & Beauty',
    'Pets & Animals',
    'Environment',
    'Innovation',
    'Technology',
    'Education',
    'Food & Nutrition',
    'Healthy Recipes',
    'Culture & Heritage',
    'Social Impact'
  ];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 150;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) {
      this.searchQuery = '';
    }
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.isSearchOpen = false;
      this.searchQuery = '';
    }
  }

  onSidebarSearch(query: string) {
    if (query && query.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: query.trim() } });
      this.isMenuOpen = false;
    }
  }
}
