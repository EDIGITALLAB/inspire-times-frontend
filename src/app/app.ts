import { Component, signal, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { filter } from 'rxjs/operators';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('inspire-times');
  isAuthPage = false;

  constructor(
    private router: Router,
    public authService: AuthService,
    private titleService: Title,
    private metaService: Meta
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage = event.url.includes('/login') ||
        event.url.includes('/signup') ||
        event.url.includes('/admin-login') ||
        event.url.includes('/forgot-password') ||
        event.url.includes('/reset-password');
      window.scrollTo(0, 0);

      // Reset dynamic meta tags if navigating away from an article details page
      const isArticlePage = event.url.includes('/article/');
      if (!isArticlePage) {
        // If navigating to home, set default title and description
        if (event.url === '/' || event.url === '' || event.urlAfterRedirects === '/') {
          this.titleService.setTitle('Inspire Times');
          this.metaService.updateTag({ name: 'description', content: 'Stories that inspire the world' });
          this.metaService.updateTag({ property: 'og:title', content: 'Inspire Times' });
          this.metaService.updateTag({ property: 'og:description', content: 'Stories that inspire the world' });
          this.metaService.updateTag({ name: 'twitter:title', content: 'Inspire Times' });
          this.metaService.updateTag({ name: 'twitter:description', content: 'Stories that inspire the world' });
        }

        // Reset general OG / Twitter tags to default fallback
        this.metaService.updateTag({ property: 'og:type', content: 'website' });
        this.metaService.updateTag({ property: 'og:image', content: 'https://inspiretimes.in/assets/logo.png' });
        this.metaService.updateTag({ property: 'og:url', content: 'https://inspiretimes.in' + event.url });
        
        this.metaService.updateTag({ name: 'twitter:image', content: 'https://inspiretimes.in/assets/logo.png' });
        this.metaService.updateTag({ name: 'twitter:url', content: 'https://inspiretimes.in' + event.url });

        // Clean up article-specific tags
        this.metaService.removeTag("property='article:published_time'");
        this.metaService.removeTag("property='article:author'");
        this.metaService.removeTag("property='article:section'");
      }
    });
  }

  ngOnInit() {
    this.authService.checkSession();
  }

  @HostListener('window:mousemove')
  @HostListener('window:click')
  @HostListener('window:keypress')
  resetTimer() {
    if (this.authService.isLoggedIn()) {
      this.authService.resetInactivityTimer();
    }
  }
}
