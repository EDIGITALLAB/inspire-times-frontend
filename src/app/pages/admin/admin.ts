import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  article = {
    title: '',
    subtitle: '',
    category: 'HEALTH & FITNESS',
    sectionType: '',
    author: '',
    heading1: '',
    content: '',
    heading2: '',
    content2: '',
    heading3: '',
    content3: '',
    sourceLink: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    highlightQuote: '',
    imageCaption: ''
  };

  currentUser: any;
  articles: any[] = [];
  isEditing = false;
  currentArticleId: number | null = null;
  
  selectedFile: File | null = null;
  selectedFile2: File | null = null;
  selectedFile3: File | null = null;
  selectedFile4: File | null = null;
  isPublishing = false;
  isMetaTitleCustomized = false;
  isMetaDescriptionCustomized = false;
  isMetaKeywordsCustomized = false;

  constructor(
    public articleService: ArticleService, 
    private route: ActivatedRoute,
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.articleService.getArticleById(params['edit']).subscribe({
          next: (art) => this.editArticle(art),
          error: (err) => console.error('Error loading article for edit', err)
        });
      }
    });
    this.loadArticles();
    this.setDefaultAuthor();
  }

  setDefaultAuthor() {
    if (this.currentUser && !this.isEditing) {
      this.article.author = this.currentUser.fullName || this.currentUser.username || '';
      
      // Default section for non-admins (Empty means Latest Stories)
      if (this.currentUser.role !== 'ADMIN') {
        this.article.sectionType = '';
      }
    }
  }

  loadArticles() {
    this.articleService.getAllArticles().subscribe({
      next: (data) => this.articles = data,
      error: (err) => console.error('Error loading articles', err)
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onFileSelected2(event: any) {
    this.selectedFile2 = event.target.files[0];
  }

  onFileSelected3(event: any) {
    this.selectedFile3 = event.target.files[0];
  }

  onFileSelected4(event: any) {
    this.selectedFile4 = event.target.files[0];
  }

  onSubmit() {
    this.isPublishing = true;
    
    const formData = new FormData();
    formData.append('title', this.article.title);
    formData.append('subtitle', this.article.subtitle);
    formData.append('content', this.article.content);
    formData.append('author', this.article.author);
    formData.append('category', this.article.category);
    formData.append('sectionType', this.article.sectionType);
    formData.append('heading1', this.article.heading1);
    formData.append('sourceLink', this.article.sourceLink);
    formData.append('heading2', this.article.heading2);
    formData.append('content2', this.article.content2);
    formData.append('heading3', this.article.heading3);
    formData.append('content3', this.article.content3);
    formData.append('metaTitle', this.article.metaTitle);
    formData.append('metaDescription', this.article.metaDescription);
    formData.append('metaKeywords', this.article.metaKeywords);
    formData.append('highlightQuote', this.article.highlightQuote);
    formData.append('imageCaption', this.article.imageCaption);
    
    if (this.selectedFile) formData.append('file', this.selectedFile);
    if (this.selectedFile2) formData.append('file2', this.selectedFile2);
    if (this.selectedFile3) formData.append('file3', this.selectedFile3);
    if (this.selectedFile4) formData.append('file4', this.selectedFile4);

    const request = this.isEditing && this.currentArticleId 
      ? this.articleService.updateArticle(this.currentArticleId, formData)
      : this.articleService.createArticle(formData);

    request.subscribe({
      next: (response) => {
        alert(this.isEditing ? 'Article updated successfully!' : 'Article published successfully!');
        this.resetForm();
        this.loadArticles();
        this.isPublishing = false;
      },
      error: (error) => {
        console.error('Error saving article', error);
        alert('Error saving article. Make sure the backend is running.');
        this.isPublishing = false;
      }
    });
  }

  editArticle(art: any) {
    this.isEditing = true;
    this.currentArticleId = art.id;
    this.article = { ...art };
    
    // Set customization flags based on existing data
    this.isMetaTitleCustomized = !!art.metaTitle && art.metaTitle !== art.title;
    this.isMetaDescriptionCustomized = !!art.metaDescription && 
      art.metaDescription !== art.subtitle && 
      art.metaDescription !== (art.content ? art.content.substring(0, 150) + (art.content.length > 150 ? '...' : '') : '');
    this.isMetaKeywordsCustomized = !!art.metaKeywords;
    
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteArticle(id: number) {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.loadArticles();
          alert('Article deleted successfully');
        },
        error: (err) => console.error('Error deleting article', err)
      });
    }
  }

  onTitleChange() {
    if (!this.isMetaTitleCustomized) {
      this.article.metaTitle = this.article.title;
    }
    this.generateKeywords();
  }

  onSubtitleChange() {
    if (!this.isMetaDescriptionCustomized) {
      this.article.metaDescription = this.article.subtitle;
    }
  }

  onContentChange() {
    if (!this.isMetaDescriptionCustomized && !this.article.subtitle) {
      const cleanContent = (this.article.content || '').replace(/<[^>]*>/g, '');
      this.article.metaDescription = cleanContent.substring(0, 150) + (cleanContent.length > 150 ? '...' : '');
    }
  }

  onCategoryChange() {
    this.generateKeywords();
  }

  generateKeywords() {
    if (!this.isMetaKeywordsCustomized) {
      const titleText = this.article.title || '';
      const words = titleText
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3);
      
      const keywords: string[] = [];
      if (this.article.category) {
        keywords.push(this.article.category.toLowerCase());
      }
      words.forEach(w => {
        if (w && !keywords.includes(w)) {
          keywords.push(w);
        }
      });
      this.article.metaKeywords = keywords.join(', ');
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentArticleId = null;
    this.isMetaTitleCustomized = false;
    this.isMetaDescriptionCustomized = false;
    this.isMetaKeywordsCustomized = false;
    this.article = {
      title: '',
      subtitle: '',
      category: 'HEALTH & FITNESS',
      sectionType: '',
      author: '',
      heading1: '',
      content: '',
      heading2: '',
      content2: '',
      heading3: '',
      content3: '',
      sourceLink: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      highlightQuote: '',
      imageCaption: ''
    };
    this.selectedFile = null;
    this.selectedFile2 = null;
    this.selectedFile3 = null;
    this.selectedFile4 = null;
    this.setDefaultAuthor();
  }
}


