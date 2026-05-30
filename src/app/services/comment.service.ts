import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserSummary {
  id: number;
  username: string;
  role: string;
  fullName: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: UserSummary;
  replies?: Comment[];
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8080/api/comments';

  constructor(private http: HttpClient) {}

  getComments(articleId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/article/${articleId}`);
  }

  addComment(articleId: number, content: string, parentId?: number): Observable<Comment> {
    const payload: any = { articleId, content };
    if (parentId !== undefined && parentId !== null) {
      payload.parentId = parentId;
    }
    return this.http.post<Comment>(this.apiUrl, payload);
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
