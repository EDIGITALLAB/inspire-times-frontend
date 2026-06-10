import { Component, signal, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('inspire-times');
  isAuthPage = false;

  constructor(private router: Router, public authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage = event.url.includes('/login') ||
        event.url.includes('/signup') ||
        event.url.includes('/admin-login') ||
        event.url.includes('/forgot-password') ||
        event.url.includes('/reset-password');
      window.scrollTo(0, 0);
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
