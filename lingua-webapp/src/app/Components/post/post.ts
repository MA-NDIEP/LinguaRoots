import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../side-bar/side-bar';
import { NavbarComponent } from '../nav-bar/nav-bar';
import { PostService, CulturalPost, Comment } from '../../Services/post';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: './post.html',
  styleUrls: ['./post.css']
})
export class PostComponent implements OnInit, OnDestroy {
 
  postsList: CulturalPost[] = [];
  filteredPosts: CulturalPost[] = [];
  searchTerm: string = '';
  currentPostType: string = 'story';
  viewMode: string = 'grid';
  isLoading: boolean = false;
  error: string = '';
  useMockData: boolean = true;
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;
  
  // Modal states
  showPostModal: boolean = false;
  showPreviewModal: boolean = false;
  showCommentsModal: boolean = false;
  editingPost: CulturalPost | null = null;
  selectedPostForPreview: CulturalPost | null = null;
  selectedPostForComments: CulturalPost | null = null;
  newComment: string = '';
  replyingTo: Comment | null = null;
  replyContent: string = '';
  
 
  activeLanguageTab: string = 'native';
  
  // Recording
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  isRecording: boolean = false;
  recordingTime: number = 0;
  recordingInterval: any;
  
 
  @ViewChild('coverImageInput') coverImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('audioFileInput') audioFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoFileInput') videoFileInput!: ElementRef<HTMLInputElement>;
  
 
  newPost: CulturalPost = {
    type: 'story',
    title: '',
    content: '',
    nativeContent: '',
    translation: '',
    englishTranslation: ''
  };
  
  private nextId: number = 5;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private postService: PostService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Post component initialized');
    
    this.subscriptions.add(
      this.postService.loading$.subscribe(loading => {
        this.isLoading = loading;
        this.cdr.detectChanges();
      })
    );
    
    this.subscriptions.add(
      this.postService.error$.subscribe(error => {
        this.error = error || '';
        this.cdr.detectChanges();
      })
    );
    
    this.subscriptions.add(
      this.postService.posts$.subscribe(posts => {
        if (posts) {
          this.postsList = posts;
          this.filterPosts();
          this.cdr.detectChanges();
        }
      })
    );
    
    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }
  }

  loadPosts(): void {
    if (this.useMockData) {
      this.loadDemoData();
      this.filterPosts();
      this.cdr.detectChanges();
    } else {
      this.postService.getAllPosts().subscribe({
        next: () => this.cdr.detectChanges(),
        error: () => {
          this.useMockData = true;
          this.loadPosts();
        }
      });
    }
  }

  loadDemoData(): void {
    this.postsList = [
      {
        postId: 1,
        type: 'story',
        title: 'The Moon Festival: A Tale of Reunion',
        content: 'Discover the legend behind the Mid-Autumn Festival, a time when families gather to admire the full moon and share mooncakes.',
        nativeContent: 'เทศกาลไหว้พระจันทร์: ตำนานแห่งการกลับมาพบกัน ตามตำนานเล่าว่า...',
        translation: 'The Mid-Autumn Festival: Legend has it that...',
        englishTranslation: 'The Mid-Autumn Festival: Legend has it that...',
        author: 'Cultural Explorer',
        publishedDate: '2 days ago',
        likes: 234,
        comments: 45,
        coverImageUrl: '',
        videoUrl: '',
        commentsList: []
      },
      {
        postId: 2,
        type: 'culture',
        title: 'The Art of Thai Silk Weaving',
        content: 'A journey through the intricate patterns and cultural significance of Thai silk, a craft passed down through generations.',
        nativeContent: 'ศิลปะการทอผ้าไหมไทย การเดินทางผ่านลวดลายอันวิจิตรและความสำคัญทางวัฒนธรรมของผ้าไหมไทย',
        translation: 'Thai silk is renowned worldwide for its unique patterns and vibrant colors.',
        englishTranslation: 'Thai silk is renowned worldwide for its unique patterns and vibrant colors.',
        author: 'Cultural Explorer',
        publishedDate: '3 hours ago',
        likes: 56,
        comments: 12,
        coverImageUrl: '',
        videoUrl: '',
        commentsList: []
      },
      {
        postId: 3,
        type: 'video',
        title: 'Traditional Khon Dance Performance',
        content: 'Watch the masked dance-drama depicting the Ramakien epic, a classical Thai performance art.',
        nativeContent: 'การแสดงโขน การแสดงที่ผสมผสานท่าทางอันสง่างาม เครื่องแต่งกายอันประณีต และการเล่าเรื่อง',
        translation: 'Khon is a traditional Thai masked dance that tells stories from the Ramakien epic.',
        englishTranslation: 'Khon is a traditional Thai masked dance that tells stories from the Ramakien epic.',
        author: 'Cultural Explorer',
        publishedDate: '1 day ago',
        likes: 189,
        comments: 34,
        views: 1200,
        coverImageUrl: '',
        videoUrl: '',
        commentsList: []
      },
      {
        postId: 4,
        type: 'audio',
        title: 'The Legend of the Naga',
        content: 'Listen to the mythical tale of the serpent-like beings of Mekong, believed to inhabit the Mekong River.',
        nativeContent: 'ตำนานพญานาค เรื่องราวของสิ่งมีชีวิตในตำนานแห่งแม่น้ำโขง',
        translation: 'The Naga is a mythical serpent believed to inhabit the Mekong River.',
        englishTranslation: 'The Naga is a mythical serpent believed to inhabit the Mekong River.',
        author: 'Cultural Explorer',
        publishedDate: '5 days ago',
        likes: 92,
        comments: 18,
        listens: 892,
        coverImageUrl: '',
        audioUrl: '',
        commentsList: []
      }
    ];
    this.nextId = 5;
  }

  filterPosts(): void {
    this.filteredPosts = this.postsList.filter(post => {
      const matchesType = post.type === this.currentPostType;
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = this.searchTerm === '' || 
        post.title.toLowerCase().includes(searchLower) ||
        (post.nativeContent && post.nativeContent.toLowerCase().includes(searchLower)) ||
        (post.content && post.content.toLowerCase().includes(searchLower));
      return matchesType && matchesSearch;
    });
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPosts.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
    this.cdr.detectChanges();
  }

  getPaginatedPosts(): CulturalPost[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredPosts.slice(start, end);
  }

  getDisplayStart(): number {
    return this.filteredPosts.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  getDisplayEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredPosts.length);
  }

  getPageNumbers(): (number | -1)[] {
    const pages: (number | -1)[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    if (start > 1) pages.push(1);
    if (start > 2) pages.push(-1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < this.totalPages - 1) pages.push(-1);
    if (end < this.totalPages) pages.push(this.totalPages);
    
    return pages;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  goToPage(page: number | -1): void {
    if (page !== -1) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filterPosts();
  }

  selectPostType(type: string): void {
    this.currentPostType = type;
    this.filterPosts();
  }

  setViewMode(mode: string): void {
    this.viewMode = mode;
    this.cdr.detectChanges();
  }

  getPostTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      story: 'fa-book-open',
      culture: 'fa-umbrella-beach',
      video: 'fa-video',
      audio: 'fa-headphones'
    };
    return icons[type] || 'fa-newspaper';
  }

  getPostTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      story: 'Story',
      culture: 'Culture',
      video: 'Video',
      audio: 'Audio Story'
    };
    return labels[type] || 'Post';
  }

  openPostCreator(): void {
    this.editingPost = null;
    this.activeLanguageTab = 'native';
    
    let defaultType: 'story' | 'culture' | 'video' | 'audio' = 'story';
    if (this.currentPostType === 'story' || this.currentPostType === 'culture' || 
        this.currentPostType === 'video' || this.currentPostType === 'audio') {
      defaultType = this.currentPostType as 'story' | 'culture' | 'video' | 'audio';
    }
    
    this.newPost = {
      type: defaultType,
      title: '',
      content: '',
      nativeContent: '',
      translation: '',
      englishTranslation: ''
    };
    this.showPostModal = true;
    this.cdr.detectChanges();
  }

  editPost(post: CulturalPost): void {
    this.editingPost = post;
    this.activeLanguageTab = 'native';
    this.newPost = { ...post };
    this.showPostModal = true;
    this.cdr.detectChanges();
  }

  closePostCreator(): void {
    this.showPostModal = false;
    this.editingPost = null;
    this.stopRecording();
    this.cdr.detectChanges();
  }

  publishPost(): void {
    if (!this.validatePost()) return;
    
   
    if (this.activeLanguageTab === 'native') {
     
      this.newPost.content = this.newPost.nativeContent || '';
    } else {
     
      this.newPost.content = this.newPost.content || '';
    }
    
   
    if (!this.newPost.translation && this.newPost.englishTranslation) {
      this.newPost.translation = this.newPost.englishTranslation;
    }
    if (!this.newPost.englishTranslation && this.newPost.translation) {
      this.newPost.englishTranslation = this.newPost.translation;
    }
    
    this.newPost.publishedDate = new Date().toLocaleDateString();
    this.savePost();
  }

  validatePost(): boolean {
    if (!this.newPost.title?.trim()) {
      this.error = 'Please enter a post title';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    
    
    if (this.activeLanguageTab === 'native' && !this.newPost.nativeContent?.trim()) {
      this.error = 'Please enter native language content';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    if (this.activeLanguageTab === 'english' && !this.newPost.englishTranslation?.trim()) {
      this.error = 'Please enter English translation';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    
    return true;
  }

  savePost(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    try {
      if (this.useMockData) {
        if (this.editingPost) {
          const index = this.postsList.findIndex(p => p.postId === this.editingPost!.postId);
          if (index !== -1) {
            this.postsList[index] = { ...this.newPost, postId: this.editingPost.postId };
          }
        } else {
          this.newPost.postId = this.nextId++;
          this.postsList.push({ ...this.newPost });
        }
      }
      
      this.filterPosts();
      this.closePostCreator();
    } catch (err) {
      this.error = 'Failed to save post. Please try again.';
      console.error('Error saving post:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  showPostPreview(post: CulturalPost): void {
    this.selectedPostForPreview = { ...post };
    this.showPreviewModal = true;
    this.cdr.detectChanges();
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    this.selectedPostForPreview = null;
    this.cdr.detectChanges();
  }

  editFromPreview(): void {
    if (this.selectedPostForPreview) {
      this.closePreviewModal();
      this.editPost(this.selectedPostForPreview);
    }
  }

  likePost(post: CulturalPost): void {
    post.likes = (post.likes || 0) + 1;
    this.cdr.detectChanges();
  }

  openComments(post: CulturalPost): void {
    this.selectedPostForComments = post;
    this.showCommentsModal = true;
    this.cdr.detectChanges();
  }

  closeCommentsModal(): void {
    this.showCommentsModal = false;
    this.selectedPostForComments = null;
    this.newComment = '';
    this.replyingTo = null;
    this.replyContent = '';
    this.cdr.detectChanges();
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.selectedPostForComments) return;
    
    const newComment: Comment = {
      commentId: Date.now(),
      username: 'You',
      author: 'You',
      content: this.newComment,
      datePublished: 'Just now',
      date: 'Just now',
      isLiked: false,
      isDeleted: false,
      likes: 0,
      replies: [],
      showReplies: false
    };
    
    this.selectedPostForComments.commentsList = this.selectedPostForComments.commentsList || [];
    this.selectedPostForComments.commentsList.push(newComment);
    this.selectedPostForComments.comments = (this.selectedPostForComments.comments || 0) + 1;
    this.newComment = '';
    this.cdr.detectChanges();
  }

  startReply(comment: Comment): void {
    this.replyingTo = comment;
    this.cdr.detectChanges();
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyContent = '';
    this.cdr.detectChanges();
  }

  addReply(): void {
    if (!this.replyContent.trim() || !this.selectedPostForComments || !this.replyingTo) return;
    
    const newReply: Comment = {
      commentId: Date.now(),
      username: 'You',
      author: 'You',
      content: this.replyContent,
      datePublished: 'Just now',
      date: 'Just now',
      isLiked: false,
      isDeleted: false,
      likes: 0,
      replies: [],
      showReplies: false
    };
    
    this.replyingTo.replies = this.replyingTo.replies || [];
    this.replyingTo.replies.push(newReply);
    this.selectedPostForComments.comments = (this.selectedPostForComments.comments || 0) + 1;
    this.cancelReply();
    this.cdr.detectChanges();
  }

  toggleReplies(comment: Comment): void {
    comment.showReplies = !comment.showReplies;
    this.cdr.detectChanges();
  }

  likeComment(comment: Comment): void {
    comment.likes = (comment.likes || 0) + 1;
    comment.isLiked = true;
    this.cdr.detectChanges();
  }

  triggerImageUpload(): void {
    if (this.coverImageInput) {
      this.coverImageInput.nativeElement.click();
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newPost.imageFile = file;
      this.newPost.image = URL.createObjectURL(file);
      this.newPost.coverImageUrl = URL.createObjectURL(file);
      this.cdr.detectChanges();
    }
    if (input) {
      input.value = '';
    }
  }

  triggerAudioUpload(): void {
    if (this.audioFileInput) {
      this.audioFileInput.nativeElement.click();
    }
  }

  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newPost.audioFile = file;
      this.newPost.audioUrl = URL.createObjectURL(file);
      this.cdr.detectChanges();
    }
    if (input) {
      input.value = '';
    }
  }

  triggerVideoUpload(): void {
    if (this.videoFileInput) {
      this.videoFileInput.nativeElement.click();
    }
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newPost.videoFile = file;
      this.newPost.video = URL.createObjectURL(file);
      this.newPost.videoUrl = URL.createObjectURL(file);
      this.cdr.detectChanges();
    }
    if (input) {
      input.value = '';
    }
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        this.newPost.audioUrl = audioUrl;
        this.newPost.audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        this.cdr.detectChanges();
        stream.getTracks().forEach(track => track.stop());
      };
      
      this.mediaRecorder.start(1000);
      this.isRecording = true;
      this.startRecordingTimer();
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      this.error = 'Unable to access microphone. Please check permissions.';
      setTimeout(() => this.error = '', 3000);
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.stopRecordingTimer();
      this.cdr.detectChanges();
    }
  }

  startRecordingTimer(): void {
    this.recordingTime = 0;
    this.recordingInterval = setInterval(() => {
      this.recordingTime++;
      this.cdr.detectChanges();
    }, 1000);
  }

  stopRecordingTimer(): void {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  clearImage(): void {
    if (this.newPost.image) {
      URL.revokeObjectURL(this.newPost.image);
    }
    if (this.newPost.coverImageUrl) {
      URL.revokeObjectURL(this.newPost.coverImageUrl);
    }
    this.newPost.image = undefined;
    this.newPost.imageFile = undefined;
    this.newPost.coverImageUrl = undefined;
    this.cdr.detectChanges();
  }

  clearAudio(): void {
    if (this.newPost.audioUrl) {
      URL.revokeObjectURL(this.newPost.audioUrl);
    }
    this.newPost.audioUrl = undefined;
    this.newPost.audioFile = undefined;
    this.stopRecording();
    this.cdr.detectChanges();
  }

  clearVideo(): void {
    if (this.newPost.video) {
      URL.revokeObjectURL(this.newPost.video);
    }
    if (this.newPost.videoUrl) {
      URL.revokeObjectURL(this.newPost.videoUrl);
    }
    this.newPost.video = undefined;
    this.newPost.videoFile = undefined;
    this.newPost.videoUrl = undefined;
    this.cdr.detectChanges();
  }

  formatRecordingTime(): string {
    const minutes = Math.floor(this.recordingTime / 60);
    const seconds = this.recordingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  playAudio(audioUrl?: string): void {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error('Error playing audio:', err));
    }
  }

  toggleTranslation(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const translationElement = target.previousElementSibling as HTMLElement;
    
    if (translationElement.style.display === 'none') {
      translationElement.style.display = 'inline';
      target.textContent = 'Hide translation';
    } else {
      translationElement.style.display = 'none';
      target.textContent = 'See translation';
    }
  }

  retryLoading(): void {
    this.postService.clearError();
    this.loadPosts();
  }
}