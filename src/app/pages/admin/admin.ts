import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
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

  // Formatting active states variables
  isBold = false;
  isItalic = false;
  isUnderline = false;
  isBulletList = false;
  isOrderedList = false;
  isBlockQuote = false;

  // Drag and drop image upload states
  isDragOverFeatured = false;
  isDragOverSection = false;

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

  get submitButtonText(): string {
    const isAdmin = this.currentUser?.role === 'ADMIN';
    if (this.isPublishing) {
      return isAdmin ? 'Saving...' : 'Submitting...';
    }
    if (this.isEditing) {
      return isAdmin ? 'Update Article' : 'Submit Update';
    }
    return isAdmin ? 'Publish Article' : 'Submit for Review';
  }

  constructor(
    public articleService: ArticleService, 
    private route: ActivatedRoute,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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
    this.articleService.getAllArticlesAdmin().subscribe({
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

  onFeaturedImageDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOverFeatured = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFile = file;
        this.featuredImagePreviewUrl = URL.createObjectURL(file);
        this.cdr.detectChanges();
      } else {
        alert('Please drop an image file.');
      }
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
        const isAdmin = this.currentUser?.role === 'ADMIN';
        const msg = isAdmin 
          ? (this.isEditing ? 'Article updated successfully!' : 'Article published successfully!')
          : (this.isEditing ? 'Article update submitted for review successfully!' : 'Article submitted for review successfully!');
        alert(msg);
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
    const newSection = {
      type: type,
      content: '',
      caption: '',
      sortOrder: this.article.sections.length
    };
    this.article.sections.push(newSection);
    this.editingSectionIndex = this.article.sections.length - 1;
    this.sectionForm = {
      type: type,
      content: '',
      caption: ''
    };
    
    this.reorderSections();
    this.showSectionModal = false;

    // Update DOM contenteditable directly and scroll to editor
    setTimeout(() => {
      const editorEl = document.querySelector('.editor-content-editable');
      if (editorEl) {
        editorEl.innerHTML = '';
      }
      this.checkActiveFormats();
      const el = document.getElementById('inline-editor-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  openEditSection(index: number) {
    this.editingSectionIndex = index;
    const sec = this.article.sections[index];
    this.sectionForm = {
      type: sec.type,
      content: sec.content,
      caption: sec.caption || ''
    };
    this.showSectionModal = false;

    // Update DOM contenteditable directly and scroll to editor
    setTimeout(() => {
      const editorEl = document.querySelector('.editor-content-editable');
      if (editorEl) {
        editorEl.innerHTML = sec.content || '';
      }
      this.checkActiveFormats();
      const el = document.getElementById('inline-editor-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  deleteSection(index: number) {
    this.article.sections.splice(index, 1);
    this.reorderSections();
    if (this.article.sections.length === 0) {
      this.editingSectionIndex = null;
    } else {
      if (this.editingSectionIndex === index) {
        this.editingSectionIndex = Math.min(index, this.article.sections.length - 1);
        this.openEditSection(this.editingSectionIndex);
      } else if (this.editingSectionIndex !== null && this.editingSectionIndex > index) {
        this.editingSectionIndex--;
      }
    }
  }

  prevSection() {
    if (this.editingSectionIndex !== null && this.editingSectionIndex > 0) {
      this.openEditSection(this.editingSectionIndex - 1);
    }
  }

  nextSection() {
    if (this.editingSectionIndex !== null && this.editingSectionIndex < this.article.sections.length - 1) {
      this.openEditSection(this.editingSectionIndex + 1);
    }
  }

  closeEditor() {
    this.editingSectionIndex = null;
    this.cdr.detectChanges();
  }

  changeSectionType(newType: string) {
    if (this.editingSectionIndex !== null) {
      const sec = this.article.sections[this.editingSectionIndex];
      const oldType = sec.type;
      sec.type = newType;
      this.sectionForm.type = newType;
      
      if (oldType === 'image' && newType !== 'image') {
        sec.content = '';
        this.sectionForm.content = '';
        setTimeout(() => {
          const editorEl = document.querySelector('.editor-content-editable');
          if (editorEl) editorEl.innerHTML = '';
        }, 50);
      } else if (oldType !== 'image' && newType === 'image') {
        sec.content = '';
        this.sectionForm.content = '';
        sec.caption = '';
        this.sectionForm.caption = '';
      } else if (oldType !== 'image' && newType !== 'image') {
        // Enforce the new limit immediately by truncating plain text
        const limit = this.getLimitForActiveSection();
        const currentLength = this.getPlainLength(sec.content);
        if (currentLength > limit) {
          if (typeof document !== 'undefined') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = sec.content;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';
            const truncatedText = plainText.substring(0, limit);
            sec.content = truncatedText;
            this.sectionForm.content = truncatedText;
            setTimeout(() => {
              const editorEl = document.querySelector('.editor-content-editable');
              if (editorEl) {
                editorEl.innerHTML = truncatedText;
              }
            }, 50);
          }
        }
      }
      
      this.cdr.detectChanges();
    }
  }

  savedRange: Range | null = null;

  saveSelection() {
    if (typeof window !== 'undefined') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const editorEl = document.querySelector('.editor-content-editable');
        if (editorEl && editorEl.contains(range.commonAncestorContainer)) {
          this.savedRange = range.cloneRange();
        }
      }
    }
  }

  restoreSelection() {
    if (typeof window !== 'undefined' && this.savedRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.savedRange);
        
        const editorEl = document.querySelector('.editor-content-editable') as HTMLElement;
        if (editorEl) {
          editorEl.focus();
        }
      }
    }
  }

  formatDoc(command: string, value: string = '') {
    this.restoreSelection();
    const editorEl = document.querySelector('.editor-content-editable') as HTMLElement;
    if (editorEl && document.activeElement !== editorEl) {
      editorEl.focus();
    }
    document.execCommand(command, false, value);
    this.saveSelection();
    this.updateActiveSectionContentDirectly();
    this.checkActiveFormats();
  }

  addLink() {
    const url = prompt('Enter URL (e.g. https://example.com):');
    if (url) {
      this.formatDoc('createLink', url);
    }
  }

  updateActiveSectionContentFromDOM(event: Event) {
    const editorEl = event.target as HTMLElement;
    if (editorEl) {
      const indexAttr = editorEl.getAttribute('data-index');
      if (indexAttr !== null) {
        const index = parseInt(indexAttr, 10);
        if (index === this.editingSectionIndex) {
          const content = editorEl.innerHTML;
          this.article.sections[index].content = content;
          this.sectionForm.content = content;
        }
      }
    }
  }

  updateActiveSectionContentDirectly() {
    if (this.editingSectionIndex !== null) {
      const editorEl = document.querySelector('.editor-content-editable');
      if (editorEl) {
        const content = editorEl.innerHTML;
        this.article.sections[this.editingSectionIndex].content = content;
        this.sectionForm.content = content;
      }
    }
  }

  checkActiveFormats() {
    if (typeof document !== 'undefined') {
      this.isBold = document.queryCommandState('bold');
      this.isItalic = document.queryCommandState('italic');
      this.isUnderline = document.queryCommandState('underline');
      this.isBulletList = document.queryCommandState('insertUnorderedList');
      this.isOrderedList = document.queryCommandState('insertOrderedList');
      
      try {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          let node: any = selection.getRangeAt(0).startContainer;
          let isQuote = false;
          while (node && node.nodeName !== 'DIV' && node.className !== 'editor-content-editable') {
            if (node.nodeName === 'BLOCKQUOTE') {
              isQuote = true;
              break;
            }
            node = node.parentNode;
          }
          this.isBlockQuote = isQuote;
        } else {
          this.isBlockQuote = false;
        }
      } catch (e) {
        this.isBlockQuote = false;
      }
      
      this.cdr.detectChanges();
    }
  }

  onCaptionChange() {
    if (this.editingSectionIndex !== null) {
      this.article.sections[this.editingSectionIndex].caption = this.sectionForm.caption;
      this.cdr.detectChanges();
    }
  }

  toggleHeadingLine(event: any) {
    const show = event.target.checked;
    this.sectionForm.caption = show ? '' : 'hide-line';
    if (this.editingSectionIndex !== null) {
      this.article.sections[this.editingSectionIndex].caption = this.sectionForm.caption;
    }
    this.cdr.detectChanges();
  }

  getPlainLength(html: string): number {
    if (!html) return 0;
    if (typeof document !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return (tempDiv.textContent || tempDiv.innerText || '').length;
    }
    const plainText = html.replace(/<[^>]*>/g, '');
    return plainText.length;
  }

  getLimitForActiveSection(): number {
    if (!this.sectionForm.type) return 2000;
    if (this.sectionForm.type === 'sub-heading') return 150;
    if (this.sectionForm.type === 'quote') return 500;
    return 2000;
  }

  onEditorKeyDown(event: KeyboardEvent) {
    const editorEl = event.target as HTMLElement;
    if (!editorEl) return;

    // Sanitize trailing newline added by browsers in contenteditable
    const plainText = (editorEl.innerText || '').replace(/\r?\n$/, '');
    const limit = this.getLimitForActiveSection();

    // Allow navigation keys, backspace, delete, Ctrl combinations, etc.
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Escape', 'Enter', 'Home', 'End', 'PageUp', 'PageDown'
    ];

    const isControlKey = event.ctrlKey || event.metaKey;

    if (plainText.length >= limit && !allowedKeys.includes(event.key) && !isControlKey) {
      event.preventDefault();
    }
  }

  onEditorPaste(event: ClipboardEvent) {
    event.preventDefault();
    const editorEl = event.target as HTMLElement;
    if (!editorEl) return;

    // Sanitize trailing newline added by browsers in contenteditable
    const plainText = (editorEl.innerText || '').replace(/\r?\n$/, '');
    const limit = this.getLimitForActiveSection();
    const remaining = limit - plainText.length;

    if (remaining <= 0) {
      return;
    }

    const pastedText = event.clipboardData?.getData('text/plain') || '';
    const truncatedText = pastedText.substring(0, remaining);

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const textNode = document.createTextNode(truncatedText);
      range.insertNode(textNode);

      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);

      this.updateActiveSectionContentDirectly();
    }
  }

  onSectionFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingSectionImage = true;
      this.articleService.uploadImage(file).subscribe({
        next: (url) => {
          this.ngZone.run(() => {
            setTimeout(() => {
              this.sectionForm.content = url;
              if (this.editingSectionIndex !== null) {
                this.article.sections[this.editingSectionIndex].content = url;
              }
              this.isUploadingSectionImage = false;
              this.cdr.detectChanges();
            }, 150);
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            setTimeout(() => {
              console.error('Error uploading section image', err);
              alert('Error uploading image.');
              this.isUploadingSectionImage = false;
              this.cdr.detectChanges();
            }, 150);
          });
        }
      });
    }
  }

  clearSectionImage() {
    this.sectionForm.content = '';
    if (this.editingSectionIndex !== null) {
      this.article.sections[this.editingSectionIndex].content = '';
    }
    this.cdr.detectChanges();
  }

  onSectionImageDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOverSection = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.isUploadingSectionImage = true;
        this.articleService.uploadImage(file).subscribe({
          next: (url) => {
            this.ngZone.run(() => {
              setTimeout(() => {
                this.sectionForm.content = url;
                if (this.editingSectionIndex !== null) {
                  this.article.sections[this.editingSectionIndex].content = url;
                }
                this.isUploadingSectionImage = false;
                this.cdr.detectChanges();
              }, 150);
            });
          },
          error: (err) => {
            this.ngZone.run(() => {
              setTimeout(() => {
                console.error('Error uploading section image', err);
                alert('Error uploading image.');
                this.isUploadingSectionImage = false;
                this.cdr.detectChanges();
              }, 150);
            });
          }
        });
      } else {
        alert('Please drop an image file.');
      }
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


