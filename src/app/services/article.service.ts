import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private backendUrl = `${API_CONFIG.apiUrl}/articles`;

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

  getAllArticlesAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/admin`, this.getHeaders()).pipe(
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

  approveArticle(id: number): Observable<any> {
    return this.http.put(`${this.backendUrl}/${id}/approve`, {}, this.getHeaders()).pipe(
      map(art => this.sanitizeArticle(art))
    );
  }

  rejectArticle(id: number, reason: string): Observable<any> {
    return this.http.put(`${this.backendUrl}/${id}/reject`, { reason }, this.getHeaders()).pipe(
      map(art => this.sanitizeArticle(art))
    );
  }

  checkPlagiarism(id: number): Observable<any> {
    return this.http.post(`${this.backendUrl}/${id}/check-plagiarism`, {}, this.getHeaders()).pipe(
      map(art => this.sanitizeArticle(art))
    );
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${API_CONFIG.apiUrl}/images/upload`, formData, { responseType: 'text' });
  }

  getImageUrl(url: string): string {
    if (!url || url.includes('default-article.png')) {
      return 'https://placehold.co/600x400.png?text=Inspire%20Times';
    }
    if (url.startsWith('http')) return url;
    return `${API_CONFIG.baseUrl}${url}`;
  }

  getReadTime(article: any): number {
    if (!article) return 0;
    let textContent = '';
    if (article.sections && article.sections.length > 0) {
      textContent = article.sections
        .filter((sec: any) => sec.type === 'paragraph' || sec.type === 'sub-heading' || sec.type === 'quote' || sec.type === 'list' || sec.type === 'highlight')
        .map((sec: any) => sec.content || '')
        .join(' ');
    } else {
      textContent = article.content || '';
    }
    const words = textContent.trim().split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(words / 200));
  }
}
