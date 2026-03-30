// post.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../side-bar/side-bar';
import { NavbarComponent } from '../nav-bar/nav-bar';

export interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  likes: number;
  replies: Comment[];
  showReplies?: boolean;
}

export interface CulturalPost {
  id: number;
  type: 'story' | 'culture' | 'video' | 'audio';
  title: string;
  content: string;
  nativeContent: string;
  englishTranslation: string;
  coverImageUrl?: string;
  additionalImages?: string[];
  videoUrl?: string;
  videoFile?: File;
  audioUrl?: string;
  audioFile?: File;
  author: string;
  publishedDate: string;
  likes: number;
  comments: number;
  views?: number;
  listens?: number;
  status: 'published' | 'draft';
  featured?: boolean;
  commentsList: Comment[];
}

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: './post.html',
  styleUrls: ['./post.css']
})
export class PostComponent implements OnInit {
  // Data properties
  postsList: CulturalPost[] = [];
  filteredPosts: CulturalPost[] = [];
  searchTerm: string = '';
  currentPostType: string = 'story';
  viewMode: string = 'grid';
  isLoading: boolean = false;
  error: string = '';
  useMockData: boolean = true; // Set to false when backend is ready
  
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
  
  // Language tab state for modal
  activeLanguageTab: string = 'native';
  
  // New post form
  newPost: CulturalPost = {
    id: 0,
    type: 'story',
    title: '',
    content: '',
    nativeContent: '',
    englishTranslation: '',
    author: 'Cultural Explorer',
    publishedDate: new Date().toLocaleDateString(),
    likes: 0,
    comments: 0,
    status: 'draft',
    featured: false,
    commentsList: []
  };
  
  private nextId: number = 5;

  ngOnInit(): void {
    this.loadPosts();
  }

  async loadPosts(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    
    try {
      if (this.useMockData) {
        this.loadDemoData();
      } else {
        await this.fetchPostsFromBackend();
      }
      this.filterPosts();
    } catch (err) {
      this.error = 'Failed to load posts. Using mock data instead.';
      console.error(err);
      this.loadDemoData();
      this.filterPosts();
    } finally {
      this.isLoading = false;
    }
  }

  async fetchPostsFromBackend(): Promise<void> {
    // This will be implemented when backend is ready
    // For now, we'll use mock data
    this.loadDemoData();
  }

  loadDemoData(): void {
    this.postsList = [
      {
        id: 1,
        type: 'story',
        title: 'The Moon Festival: A Tale of Reunion',
        content: 'Discover the legend behind the Mid-Autumn Festival, a time when families gather to admire the full moon and share mooncakes. This ancient tradition dates back over 3,000 years and celebrates the harvest season.',
        nativeContent: 'เทศกาลไหว้พระจันทร์: ตำนานแห่งการกลับมาพบกัน ตามตำนานเล่าว่า...',
        englishTranslation: 'The Mid-Autumn Festival: Legend has it that...',
        author: 'Cultural Explorer',
        publishedDate: '2 days ago',
        likes: 234,
        comments: 45,
        status: 'published',
        featured: true,
        commentsList: [
          {
            id: 1,
            author: 'John Doe',
            content: 'Beautiful story! I love learning about different cultures.',
            date: '2 days ago',
            likes: 5,
            replies: [
              {
                id: 2,
                author: 'Cultural Explorer',
                content: 'Thank you! Glad you enjoyed it.',
                date: '1 day ago',
                likes: 2,
                replies: []
              }
            ],
            showReplies: false
          },
          {
            id: 3,
            author: 'Sarah Chen',
            content: 'This reminds me of my childhood celebrations!',
            date: '1 day ago',
            likes: 3,
            replies: [],
            showReplies: false
          }
        ]
      },
      {
        id: 2,
        type: 'culture',
        title: 'The Art of Thai Silk Weaving',
        content: 'A journey through the intricate patterns and cultural significance of Thai silk, a craft passed down through generations in the northeastern region of Thailand.',
        nativeContent: 'ศิลปะการทอผ้าไหมไทย การเดินทางผ่านลวดลายอันวิจิตรและความสำคัญทางวัฒนธรรมของผ้าไหมไทย',
        englishTranslation: 'Thai silk is renowned worldwide for its unique patterns and vibrant colors. The weaving process is a meticulous art form that requires great skill and patience.',
        author: 'Cultural Explorer',
        publishedDate: '3 hours ago',
        likes: 56,
        comments: 12,
        status: 'published',
        commentsList: [
          {
            id: 4,
            author: 'Maria Garcia',
            content: 'The craftsmanship is incredible!',
            date: '2 hours ago',
            likes: 2,
            replies: [],
            showReplies: false
          }
        ]
      },
      {
        id: 3,
        type: 'video',
        title: 'Traditional Khon Dance Performance',
        content: 'Watch the masked dance-drama depicting the Ramakien epic, a classical Thai performance art that combines graceful movements, elaborate costumes, and storytelling.',
        nativeContent: 'การแสดงโขน การแสดงที่ผสมผสานท่าทางอันสง่างาม เครื่องแต่งกายอันประณีต และการเล่าเรื่อง',
        englishTranslation: 'Khon is a traditional Thai masked dance that was historically performed only in the royal court. It tells stories from the Ramakien epic.',
        author: 'Cultural Explorer',
        publishedDate: '1 day ago',
        likes: 189,
        comments: 34,
        views: 1200,
        status: 'published',
        commentsList: []
      },
      {
        id: 4,
        type: 'audio',
        title: 'The Legend of the Naga',
        content: 'Listen to the mythical tale of the serpent-like beings of Mekong, believed to inhabit the Mekong River and protect the waters.',
        nativeContent: 'ตำนานพญานาค เรื่องราวของสิ่งมีชีวิตในตำนานแห่งแม่น้ำโขง เชื่อกันว่าอาศัยอยู่ในแม่น้ำโขงและปกป้องสายน้ำ',
        englishTranslation: 'The Naga is a mythical serpent believed to inhabit the Mekong River. Local legends tell of these powerful beings that control the waters and bring prosperity.',
        author: 'Cultural Explorer',
        publishedDate: '5 days ago',
        likes: 92,
        comments: 18,
        listens: 892,
        status: 'published',
        commentsList: []
      }
    ];
    this.nextId = 5;
  }

  filterPosts(): void {
    this.filteredPosts = this.postsList.filter(post => {
      const matchesType = this.currentPostType === 'all' || post.type === this.currentPostType;
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = this.searchTerm === '' || 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.nativeContent.toLowerCase().includes(searchLower);
      return matchesType && matchesSearch;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPosts.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
  }

  getPaginatedPosts(): CulturalPost[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredPosts.slice(start, end);
  }

  getFeaturedPost(): CulturalPost | undefined {
    return this.postsList.find(post => post.featured === true && post.status === 'published');
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
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number | -1): void {
    if (page !== -1) {
      this.currentPage = page;
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
    
    // Fix: Ensure type is properly set to one of the allowed values
    let defaultType: 'story' | 'culture' | 'video' | 'audio' = 'story';
    if (this.currentPostType === 'story' || this.currentPostType === 'culture' || 
        this.currentPostType === 'video' || this.currentPostType === 'audio') {
      defaultType = this.currentPostType as 'story' | 'culture' | 'video' | 'audio';
    }
    
    this.newPost = {
      id: 0,
      type: defaultType,
      title: '',
      content: '',
      nativeContent: '',
      englishTranslation: '',
      author: 'Cultural Explorer',
      publishedDate: new Date().toLocaleDateString(),
      likes: 0,
      comments: 0,
      status: 'draft',
      featured: false,
      commentsList: []
    };
    this.showPostModal = true;
  }

  editPost(post: CulturalPost): void {
    this.editingPost = post;
    this.activeLanguageTab = 'native';
    this.newPost = { ...post };
    this.showPostModal = true;
  }

  closePostCreator(): void {
    this.showPostModal = false;
    this.editingPost = null;
  }

  saveAsDraft(): void {
    if (!this.validatePost()) return;
    this.newPost.status = 'draft';
    this.newPost.publishedDate = new Date().toLocaleDateString();
    this.savePost();
  }

  publishPost(): void {
    if (!this.validatePost()) return;
    this.newPost.status = 'published';
    this.newPost.publishedDate = new Date().toLocaleDateString();
    this.savePost();
  }

  validatePost(): boolean {
    if (!this.newPost.title.trim()) {
      this.error = 'Please enter a post title';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    if (!this.newPost.content.trim() && !this.newPost.nativeContent.trim()) {
      this.error = 'Please enter content in at least one language';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    return true;
  }

  async savePost(): Promise<void> {
    if (this.editingPost) {
      const index = this.postsList.findIndex(p => p.id === this.editingPost!.id);
      if (index !== -1) {
        this.postsList[index] = { ...this.newPost, id: this.editingPost.id };
        
        if (!this.useMockData) {
          await this.updatePostInBackend(this.postsList[index]);
        }
      }
    } else {
      this.newPost.id = this.nextId++;
      this.postsList.push({ ...this.newPost });
      
      if (!this.useMockData) {
        await this.createPostInBackend(this.postsList[this.postsList.length - 1]);
      }
    }
    this.filterPosts();
    this.closePostCreator();
  }

  async createPostInBackend(post: CulturalPost): Promise<void> {
    // Backend connection will go here when ready
    console.log('Creating post in backend:', post);
  }

  async updatePostInBackend(post: CulturalPost): Promise<void> {
    // Backend connection will go here when ready
    console.log('Updating post in backend:', post);
  }

  showPostPreview(post: CulturalPost): void {
    this.selectedPostForPreview = { ...post };
    this.showPreviewModal = true;
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    this.selectedPostForPreview = null;
  }

  editFromPreview(): void {
    if (this.selectedPostForPreview) {
      this.closePreviewModal();
      this.editPost(this.selectedPostForPreview);
    }
  }

  likePost(post: CulturalPost): void {
    post.likes++;
    if (!this.useMockData) {
      this.likePostInBackend(post.id);
    }
  }

  async likePostInBackend(postId: number): Promise<void> {
    // Backend connection will go here when ready
    console.log('Liking post:', postId);
  }

  openComments(post: CulturalPost): void {
    this.selectedPostForComments = post;
    this.showCommentsModal = true;
  }

  closeCommentsModal(): void {
    this.showCommentsModal = false;
    this.selectedPostForComments = null;
    this.newComment = '';
    this.replyingTo = null;
    this.replyContent = '';
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.selectedPostForComments) return;
    
    const newComment: Comment = {
      id: Date.now(),
      author: 'You',
      content: this.newComment,
      date: 'Just now',
      likes: 0,
      replies: [],
      showReplies: false
    };
    
    this.selectedPostForComments.commentsList.push(newComment);
    this.selectedPostForComments.comments++;
    this.newComment = '';
    
    if (!this.useMockData) {
      this.addCommentToBackend(this.selectedPostForComments.id, newComment);
    }
  }

  async addCommentToBackend(postId: number, comment: Comment): Promise<void> {
    // Backend connection will go here when ready
    console.log('Adding comment to post:', postId, comment);
  }

  startReply(comment: Comment): void {
    this.replyingTo = comment;
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyContent = '';
  }

  addReply(): void {
    if (!this.replyContent.trim() || !this.selectedPostForComments || !this.replyingTo) return;
    
    const newReply: Comment = {
      id: Date.now(),
      author: 'You',
      content: this.replyContent,
      date: 'Just now',
      likes: 0,
      replies: [],
      showReplies: false
    };
    
    this.replyingTo.replies.push(newReply);
    this.selectedPostForComments.comments++;
    this.cancelReply();
    
    if (!this.useMockData) {
      this.addReplyToBackend(this.selectedPostForComments.id, this.replyingTo.id, newReply);
    }
  }

  async addReplyToBackend(postId: number, commentId: number, reply: Comment): Promise<void> {
    // Backend connection will go here when ready
    console.log('Adding reply to comment:', postId, commentId, reply);
  }

  toggleReplies(comment: Comment): void {
    comment.showReplies = !comment.showReplies;
  }

  likeComment(comment: Comment): void {
    comment.likes++;
  }

  triggerImageUpload(): void {
    const fileInput = document.querySelector('#coverImageInput') as HTMLInputElement;
    fileInput?.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newPost.coverImageUrl = URL.createObjectURL(file);
    }
  }

  triggerAudioUpload(): void {
    const fileInput = document.querySelector('#audioFileInput') as HTMLInputElement;
    fileInput?.click();
  }

  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newPost.audioFile = file;
      this.newPost.audioUrl = URL.createObjectURL(file);
    }
  }

  triggerVideoUpload(): void {
    const fileInput = document.querySelector('#videoFileInput') as HTMLInputElement;
    fileInput?.click();
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newPost.videoFile = file;
      this.newPost.videoUrl = URL.createObjectURL(file);
    }
  }

  startRecording(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks: BlobPart[] = [];
          
          mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
          });
          
          mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
            
            this.newPost.audioFile = audioFile;
            this.newPost.audioUrl = audioUrl;
            
            stream.getTracks().forEach(track => track.stop());
          });
          
          mediaRecorder.start();
          
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, 30000); // Stop after 30 seconds
          
          alert('Recording started! Will stop automatically after 30 seconds.');
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          alert('Unable to access microphone. Please check permissions.');
        });
    } else {
      alert('Audio recording is not supported in this browser.');
    }
  }

  clearImage(): void {
    this.newPost.coverImageUrl = undefined;
  }

  clearAudio(): void {
    this.newPost.audioUrl = undefined;
    this.newPost.audioFile = undefined;
  }

  clearVideo(): void {
    this.newPost.videoUrl = undefined;
    this.newPost.videoFile = undefined;
  }

  toggleTranslation(event: MouseEvent): void {
    const targetElement = event.currentTarget as HTMLElement;
    if (targetElement && targetElement.previousElementSibling) {
      const translationText = targetElement.previousElementSibling as HTMLElement;
      const isHidden = translationText.style.display === 'none';
      
      if (isHidden) {
        translationText.style.display = 'inline';
        targetElement.textContent = 'See translation';
      } else {
        translationText.style.display = 'none';
        targetElement.textContent = 'Hide translation';
      }
    }
  }

  playAudio(audioUrl?: string): void {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error('Error playing audio:', err));
    }
  }
}