import { Component, ChangeDetectorRef } from '@angular/core';
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
    category: '',
    sectionType: '',
    author: '',
    sourceLink: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    imageUrl: '',
    imageCaption: '',
    sections: [] as any[]
  };

  currentUser: any;
  articles: any[] = [];
  isEditing = false;
  currentArticleId: number | null = null;
  
  selectedFile: File | null = null;
  isPublishing = false;
  isMetaTitleCustomized = false;
  isMetaDescriptionCustomized = false;
  isMetaKeywordsCustomized = false;

  // Modal and section editing variables
  showSectionModal = false;
  editingSectionIndex: number | null = null;
  sectionForm = {
    type: 'paragraph',
    content: '',
    caption: ''
  };
  isUploadingSectionImage = false;

  // Drag and Drop variables
  draggedIndex: number | null = null;

  featuredImagePreviewUrl = '';

  categories = [
    'Inspiration',
    'Health & Fitness',
    'Spiritual',
    'Travel',
    'Relationship',
    'Lifestyle',
    'Fashion & Beauty',
    'Pets & Animals',
    'Environment',
    'Innovation',
    'Technology',
    'AI',
    'Education',
    'Food & Nutrition',
    'Healthy Recipes',
    'Culture & Heritage',
    'Social Impact'
  ];

  constructor(
    public articleService: ArticleService, 
    private route: ActivatedRoute,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
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
          next: (art) => {
            this.editArticle(art);
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error loading article for edit', err)
        });
      }
      this.cdr.detectChanges();
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
      next: (data) => {
        this.articles = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading articles', err)
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.featuredImagePreviewUrl = URL.createObjectURL(this.selectedFile);
    } else {
      this.featuredImagePreviewUrl = '';
    }
  }

  clearFileSlot(event: Event, slotNum: number, input: HTMLInputElement) {
    event.stopPropagation();
    event.preventDefault();
    if (slotNum === 1) {
      this.selectedFile = null;
      this.featuredImagePreviewUrl = '';
      this.article.imageUrl = '';
    }
    input.value = '';
    this.cdr.detectChanges();
  }

  onSubmit() {
    if (!this.article.category || !this.article.category.trim()) {
      alert('Please select or enter a category.');
      return;
    }
    this.isPublishing = true;

    const formData = new FormData();
    formData.append('title', this.article.title || '');
    formData.append('subtitle', this.article.subtitle || '');
    formData.append('author', this.article.author || '');
    formData.append('category', this.article.category || '');
    formData.append('sectionType', this.article.sectionType || '');
    formData.append('sourceLink', this.article.sourceLink || '');
    formData.append('metaTitle', this.article.metaTitle || '');
    formData.append('metaDescription', this.article.metaDescription || '');
    formData.append('metaKeywords', this.article.metaKeywords || '');
    formData.append('imageCaption', this.article.imageCaption || '');
    formData.append('sections', JSON.stringify(this.article.sections || []));
    
    if (this.selectedFile) formData.append('file', this.selectedFile);

    const request = this.isEditing && this.currentArticleId 
      ? this.articleService.updateArticle(this.currentArticleId, formData)
      : this.articleService.createArticle(formData);

    request.subscribe({
      next: (response) => {
        alert(this.isEditing ? 'Article updated successfully!' : 'Article published successfully!');
        this.resetForm();
        this.loadArticles();
        this.isPublishing = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error saving article', error);
        alert('Error saving article. Make sure the backend is running.');
        this.isPublishing = false;
        this.cdr.detectChanges();
      }
    });
  }

  editArticle(art: any) {
    this.isEditing = true;
    this.currentArticleId = art.id;
    this.article = { 
      ...art,
      sections: this.initializeSections(art)
    };
    
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
          this.cdr.detectChanges();
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
      category: '',
      sectionType: '',
      author: '',
      sourceLink: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      imageUrl: '',
      imageCaption: '',
      sections: [] as any[]
    };
    this.selectedFile = null;
    this.featuredImagePreviewUrl = '';
    this.setDefaultAuthor();
  }

  initializeSections(art: any) {
    if (art.sections && art.sections.length > 0) {
      return [...art.sections].sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return [];
  }

  openAddSection(type: string) {
    this.editingSectionIndex = null;
    this.sectionForm = {
      type: type,
      content: '',
      caption: ''
    };
    this.showSectionModal = true;
  }

  openEditSection(index: number) {
    this.editingSectionIndex = index;
    const sec = this.article.sections[index];
    this.sectionForm = {
      type: sec.type,
      content: sec.content,
      caption: sec.caption || ''
    };
    this.showSectionModal = true;
  }

  deleteSection(index: number) {
    this.article.sections.splice(index, 1);
    this.reorderSections();
  }

  saveSection() {
    if (this.sectionForm.type !== 'image' && !this.sectionForm.content.trim()) {
      alert('Section content cannot be empty.');
      return;
    }
    if (this.sectionForm.type === 'image' && !this.sectionForm.content) {
      alert('Please upload an image first.');
      return;
    }

    const sectionData = {
      type: this.sectionForm.type,
      content: this.sectionForm.content,
      caption: this.sectionForm.type === 'image' ? this.sectionForm.caption : '',
      sortOrder: 0
    };

    if (this.editingSectionIndex !== null) {
      this.article.sections[this.editingSectionIndex] = sectionData;
    } else {
      this.article.sections.push(sectionData);
    }

    this.reorderSections();
    this.showSectionModal = false;
  }

  onSectionFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingSectionImage = true;
      this.articleService.uploadImage(file).subscribe({
        next: (url) => {
          this.sectionForm.content = url;
          this.isUploadingSectionImage = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error uploading section image', err);
          alert('Error uploading image.');
          this.isUploadingSectionImage = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onDragStart(index: number) {
    this.draggedIndex = index;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(index: number) {
    if (this.draggedIndex !== null && this.draggedIndex !== index) {
      const draggedSection = this.article.sections[this.draggedIndex];
      this.article.sections.splice(this.draggedIndex, 1);
      this.article.sections.splice(index, 0, draggedSection);
      this.reorderSections();
    }
    this.draggedIndex = null;
  }

  moveSectionUp(index: number, event: Event) {
    event.stopPropagation();
    if (index > 0) {
      const temp = this.article.sections[index];
      this.article.sections[index] = this.article.sections[index - 1];
      this.article.sections[index - 1] = temp;
      this.reorderSections();
    }
  }

  moveSectionDown(index: number, event: Event) {
    event.stopPropagation();
    if (index < this.article.sections.length - 1) {
      const temp = this.article.sections[index];
      this.article.sections[index] = this.article.sections[index + 1];
      this.article.sections[index + 1] = temp;
      this.reorderSections();
    }
  }

  reorderSections() {
    this.article.sections.forEach((sec: any, idx: number) => {
      sec.sortOrder = idx;
    });
    this.cdr.detectChanges();
  }
}


