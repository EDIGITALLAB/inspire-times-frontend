import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private backendUrl = 'http://localhost:8080/api/articles';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    return {};
  }

  getAllArticles(): Observable<any[]> {
    return this.http.get<any[]>(this.backendUrl);
  }

  getMyArticles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/my`, this.getHeaders());
  }

  getArticleById(id: string): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/${id}`);
  }

  getArticleBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/slug/${slug}`);
  }

  getArticlesBySectionType(sectionType: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/section/${sectionType}`);
  }

  getArticlesByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/category/${category}`);
  }

  getTrendingArticles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/trending`);
  }

  searchArticles(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/search?q=${query}`);
  }

  incrementViewCount(id: number): Observable<any> {
    return this.http.post(`${this.backendUrl}/${id}/view`, {});
  }

  createArticle(formData: FormData): Observable<any> {
    return this.http.post(`${this.backendUrl}/with-image`, formData, this.getHeaders());
  }

  updateArticle(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.backendUrl}/${id}`, formData, this.getHeaders());
  }

  deleteArticle(id: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${id}`, this.getHeaders());
  }

  getImageUrl(url: string): string {
    if (!url) return 'https://placehold.co/600x400';
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  }
}
