import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private backendUrl = 'http://localhost:8080/api/articles';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    return {};
  }

  private sanitizeArticle(article: any): any {
    if (!article) return article;
    const sanitized = { ...article };
    for (const key of Object.keys(sanitized)) {
      if (sanitized[key] === 'null' || sanitized[key] === 'undefined') {
        sanitized[key] = null;
      }
    }
    return sanitized;
  }

  private sanitizeArticles(articles: any[]): any[] {
    if (!articles) return [];
    return articles.map(art => this.sanitizeArticle(art));
  }

  getAllArticles(): Observable<any[]> {
    return this.http.get<any[]>(this.backendUrl).pipe(
      map(arts => this.sanitizeArticles(arts))
    );
  }

  getMyArticles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/my`, this.getHeaders()).pipe(
      map(arts => this.sanitizeArticles(arts))
    );
  }

  getArticleById(id: string): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/${id}`).pipe(
      map(art => this.sanitizeArticle(art))
    );
  }

  getArticleBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/slug/${slug}`).pipe(
      map(art => this.sanitizeArticle(art))
    );
  }

  getArticlesBySectionType(sectionType: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/section/${sectionType}`).pipe(
      map(arts => this.sanitizeArticles(arts))
    );
  }

  getArticlesByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/category/${category}`).pipe(
      map(arts => this.sanitizeArticles(arts))
    );
  }

  getTrendingArticles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/trending`).pipe(
      map(arts => this.sanitizeArticles(arts))
    );
  }

  searchArticles(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/search?q=${query}`).pipe(
      map(arts => this.sanitizeArticles(arts))
    );
  }

  incrementViewCount(id: number): Observable<any> {
    return this.http.post(`${this.backendUrl}/${id}/view`, {});
  }

  createArticle(formData: FormData): Observable<any> {
    return this.http.post(`${this.backendUrl}/with-image`, formData, this.getHeaders()).pipe(
      map(art => this.sanitizeArticle(art))
    );
  }

  updateArticle(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.backendUrl}/${id}`, formData, this.getHeaders()).pipe(
      map(art => this.sanitizeArticle(art))
    );
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
