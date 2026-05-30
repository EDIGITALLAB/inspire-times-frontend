import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
  public currentUser$ = this.currentUserSubject.asObservable();
  private inactivityTimer: any;
  private readonly INACTIVITY_TIME = 30 * 60 * 1000; // 30 Minutes

  constructor(private http: HttpClient) { 
    if (this.isLoggedIn()) {
      this.resetInactivityTimer();
    }
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData, { responseType: 'text' });
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((user: any) => {
        if (user && user.username) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.resetInactivityTimer();
        }
      })
    );
  }

  resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = setTimeout(() => {
      this.logout();
      alert('You have been logged out due to inactivity.');
      window.location.href = '/login';
    }, this.INACTIVITY_TIME);
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => console.log('Cookie cleared successfully'),
      error: (err) => console.error('Error clearing cookie', err)
    });
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next({});
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
  }

  isLoggedIn(): boolean {
    const user = this.currentUserSubject.value;
    return !!(user && user.username);
  }

  checkSession() {
    if (this.isLoggedIn()) {
      this.http.get('http://localhost:8080/api/users/profile').subscribe({
        next: (user: any) => {
          if (user && user.username) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        },
        error: (err) => {
          console.error('Session verification failed or backend is down. Logging out.', err);
          this.logout();
        }
      });
    }
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  refreshToken(): Observable<any> {
    return this.http.post(`http://localhost:8080/api/auth/refresh`, {});
  }

  // User Management (Admin Only)
  private getHeaders() {
    return {};
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/users', this.getHeaders());
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/users/${id}`, this.getHeaders());
  }

  updateUserRole(id: number, role: string): Observable<any> {
    return this.http.put(`http://localhost:8080/api/users/${id}/role`, `"${role}"`, this.getHeaders());
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/users/profile`, userData, this.getHeaders()).pipe(
      tap((updatedUser: any) => {
        // Update local storage with new info
        const current = this.getCurrentUser();
        const merged = { ...current, ...updatedUser };
        localStorage.setItem('currentUser', JSON.stringify(merged));
        this.currentUserSubject.next(merged);
      })
    );
  }

  changePassword(passwordData: any): Observable<any> {
    return this.http.post(`http://localhost:8080/api/users/change-password`, passwordData, this.getHeaders());
  }
}
