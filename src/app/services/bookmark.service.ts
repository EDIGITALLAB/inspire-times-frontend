import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private apiUrl = `${API_CONFIG.apiUrl}/bookmarks`;

  constructor(private http: HttpClient) { }

  getBookmarks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addBookmark(articleId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${articleId}`, {});
  }

  removeBookmark(articleId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${articleId}`);
  }

  checkBookmark(articleId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${articleId}`);
  }
}
