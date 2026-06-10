import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${API_CONFIG.apiUrl}/auth`;
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
      this.http.get(`${API_CONFIG.apiUrl}/users/profile`).subscribe({
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
    return this.http.post(`${API_CONFIG.apiUrl}/auth/refresh`, {});
  }

  // User Management (Admin Only)
  private getHeaders() {
    return {};
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${API_CONFIG.apiUrl}/users`, this.getHeaders());
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${API_CONFIG.apiUrl}/users/${id}`, this.getHeaders());
  }

  updateUserRole(id: number, role: string): Observable<any> {
    return this.http.put(`${API_CONFIG.apiUrl}/users/${id}/role`, `"${role}"`, this.getHeaders());
  }

  toggleUserStatus(id: number): Observable<any> {
    return this.http.put(`${API_CONFIG.apiUrl}/users/${id}/toggle-status`, {}, this.getHeaders());
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.put(`${API_CONFIG.apiUrl}/users/profile`, userData, this.getHeaders()).pipe(
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
    return this.http.post(`${API_CONFIG.apiUrl}/users/change-password`, passwordData, this.getHeaders());
  }
}
