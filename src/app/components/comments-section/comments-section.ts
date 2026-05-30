import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommentService, Comment } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './comments-section.html',
  styleUrl: './comments-section.css'
})
export class CommentsSection implements OnInit, OnDestroy {
  @Input() articleId!: number;

  comments: Comment[] = [];
  currentUser: any = null;
  newCommentText = '';
  
  // Reply states
  activeReplyId: number | null = null;
  replyText = '';

  private authSub!: Subscription;

  constructor(
    private commentService: CommentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = (user && user.username) ? user : null;
      this.cdr.detectChanges();
    });

    if (this.articleId) {
      this.loadComments();
    }
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  loadComments() {
    this.commentService.getComments(this.articleId).subscribe({
      next: (data) => {
        this.comments = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading comments', err);
      }
    });
  }

  submitComment() {
    if (!this.newCommentText.trim()) return;

    this.commentService.addComment(this.articleId, this.newCommentText.trim()).subscribe({
      next: (newComment) => {
        // Prepend new comment to list for real-time UI update
        this.comments.unshift(newComment);
        this.newCommentText = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding comment', err);
      }
    });
  }

  submitReply(parentId: number) {
    if (!this.replyText.trim()) return;

    this.commentService.addComment(this.articleId, this.replyText.trim(), parentId).subscribe({
      next: (newReply) => {
        // Find parent comment in current list and push reply
        const parent = this.comments.find(c => c.id === parentId);
        if (parent) {
          if (!parent.replies) {
            parent.replies = [];
          }
          parent.replies.push(newReply);
        }
        this.activeReplyId = null;
        this.replyText = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding reply', err);
      }
    });
  }

  deleteComment(id: number, isReply = false, parentId?: number) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.commentService.deleteComment(id).subscribe({
      next: () => {
        if (isReply && parentId !== undefined) {
          const parent = this.comments.find(c => c.id === parentId);
          if (parent && parent.replies) {
            parent.replies = parent.replies.filter(r => r.id !== id);
          }
        } else {
          this.comments = this.comments.filter(c => c.id !== id);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting comment', err);
      }
    });
  }

  toggleReplyForm(commentId: number) {
    if (this.activeReplyId === commentId) {
      this.activeReplyId = null;
      this.replyText = '';
    } else {
      this.activeReplyId = commentId;
      this.replyText = '';
    }
    this.cdr.detectChanges();
  }

  canDelete(comment: Comment): boolean {
    if (!this.currentUser) return false;
    // Comment author or Admin can delete
    return this.currentUser.role === 'ADMIN' || this.currentUser.username === comment.user.username;
  }

  getAvatarLetter(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'U';
  }
}
