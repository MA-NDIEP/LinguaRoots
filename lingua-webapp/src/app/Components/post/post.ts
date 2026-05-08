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
  currentPostType: 'STORY' | 'CULTURE' | 'RIDDLE' | 'PROVERB' = 'STORY';
  viewMode: 'grid' | 'list' = 'grid';
  isLoading: boolean = false;
  error: string = '';

  private useMockData: boolean = true;

  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;

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

  currentImageIndex: number = 0;
  showImageGallery: boolean = false;
  galleryImages: string[] = [];

  @ViewChild('coverImageInput') coverImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('galleryImageInput') galleryImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('audioInput') audioInput!: ElementRef<HTMLInputElement>;

  newPost: CulturalPost = {
    type: 'STORY',
    title: '',
    content: '',
    translation: '',
    images: []
  };

  private subscriptions: Subscription = new Subscription();

  constructor(
    private postService: PostService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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

    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadPosts(): void {
    if (this.useMockData) {
      this.isLoading = true;
      setTimeout(() => {
        this.postsList = this.getMockPosts();
        this.filterPosts();
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 800);
    } else {
      this.postService.getAllPosts().subscribe({
        next: (posts) => {
          this.postsList = posts;
          this.filterPosts();
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Failed to load posts. Please check if backend is running.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  private getMockPosts(): CulturalPost[] {
    return [
      {
        postId: 1,
        type: 'STORY',
        title: 'The Legend of the Moon Festival',
        content: 'Long ago, ten suns appeared in the sky, scorching the Earth. The hero Hou Yi shot down nine suns, saving humanity. As a reward, he received an elixir of immortality. His beautiful wife Chang\'e drank it to protect it from a greedy apprentice and floated to the moon, where she lives to this day.',
        translation: 'The Mid-Autumn Festival is one of the most important traditional festivals in Chinese culture. Families gather to appreciate the bright full moon, eat mooncakes together, and share stories about Chang\'e, the moon goddess.',
        image: 'https://images.unsplash.com/photo-1535385794809-21f8c11e565f?w=500',
        images: [
          'https://images.unsplash.com/photo-1535385794809-21f8c11e565f?w=500',
          'https://images.unsplash.com/photo-1518792528501-352f8299dc6b?w=500',
          'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=500'
        ],
        likes: 42,
        isLiked: false,
        commentsCount: 2
      },
      {
        postId: 2,
        type: 'STORY',
        title: 'The Spirit of Songkran',
        content: 'สงกรานต์เป็นปีใหม่ไทย ซึ่งจัดขึ้นในช่วงเดือนเมษายน เป็นช่วงเวลาแห่งการเฉลิมฉลอง การทำบุญ และการรดน้ำขอพรจากผู้ใหญ่ ผู้คนกลับบ้านเกิดเพื่อพบปะครอบครัว',
        translation: 'Songkran is the Thai New Year festival celebrated in April. It\'s a time for merit-making, paying respect to elders, and family reunions.',
        image: 'https://images.unsplash.com/photo-1559599233-4b8f4d76c1b3?w=500',
        images: ['https://images.unsplash.com/photo-1559599233-4b8f4d76c1b3?w=500'],
        video: 'https://www.youtube.com/embed/example1',
        likes: 28,
        isLiked: true,
        commentsCount: 0
      },
      {
        postId: 3,
        type: 'CULTURE',
        title: 'Thai Silk Weaving Tradition',
        content: 'ศิลปะการทอผ้าไหมไทยมีประวัติศาสตร์ยาวนานกว่าพันปี ชาวไทยในภาคตะวันออกเฉียงเหนือสืบทอดภูมิปัญญานี้จากรุ่นสู่รุ่น กระบวนการผลิตเริ่มจากการเลี้ยงหนอนไหม การปั่นไหม การย้อมสีธรรมชาติจากพืช',
        translation: 'Thai silk weaving is an ancient art form passed down through generations in northeastern Thailand. The process involves silk worm cultivation, natural dyeing using local plants, and intricate hand-weaving techniques.',
        image: 'https://images.unsplash.com/photo-1563089146-4d5a5a1d05a2?w=500',
        images: [],
        likes: 15,
        isLiked: false,
        commentsCount: 0
      },
      {
        postId: 4,
        type: 'CULTURE',
        title: 'Balinese Offering Traditions',
        content: 'Di Bali, sesajen atau canang sari adalah bagian penting dari kehidupan sehari-hari. Setiap pagi, umat Hindu Bali membuat sesajen kecil dari daun kelapa yang diisi dengan bunga-bunga berwarna-warni, beras, dan kemenyan.',
        translation: 'In Bali, daily offerings called canang sari are an essential part of Hindu tradition. These small palm leaf trays filled with colorful flowers, rice, and incense represent gratitude to the gods.',
        image: 'https://images.unsplash.com/photo-1554714842-9cda1b5f9c86?w=500',
        images: [],
        likes: 56,
        isLiked: true,
        commentsCount: 0
      },
      {
        postId: 5,
        type: 'RIDDLE',
        title: 'The Wise Bamboo - A Riddle from Thailand',
        content: 'ข้าคือต้นไม้ที่สูงสง่า ลำกลวงเป็นปล้องๆ เมื่อลมพัดมาข้าจะไหวเอน แต่ไม่หักง่าย ใช้สร้างบ้านเรือน ทำเครื่องเรือน และในพิธีกรรมต่างๆ ข้าคืออะไร?',
        translation: 'I am a tall and elegant plant with hollow sections. When the wind blows, I sway but do not break easily. I am used to build houses, furniture, and in various ceremonies. What am I?',
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500',
        images: [],
        riddleAnswer: 'Bamboo (ไผ่)',
        likes: 33,
        isLiked: false,
        commentsCount: 1
      },
      {
        postId: 6,
        type: 'PROVERB',
        title: 'The Crooked Tree Proverb - Lao Wisdom',
        content: 'ຕົ້ນໄມ້ຄົດງໍ ມັກຈະຖືກນຳໄປໃຊ້ງານກ່ອນຕົ້ນໄມ້ກົງ',
        translation: 'The crooked tree is often used before the straight tree. (Meaning: Those seen as imperfect often find purpose sooner than those who wait for perfection.)',
        image: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=500',
        images: [],
        audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        likes: 19,
        isLiked: false,
        commentsCount: 1
      },
      {
        postId: 7,
        type: 'RIDDLE',
        title: 'The Whispering Bamboo - A Riddle with Audio',
        content: '',
        translation: 'I am tall and hollow, I sway but never break. When the wind blows through me, a whispering sound I make. What am I?',
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500',
        images: [],
        riddleAnswer: 'Bamboo (竹子)',
        audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        likes: 45,
        isLiked: false,
        commentsCount: 3
      }
    ];
  }

  private getMockComments(postId: number): Comment[] {
    const commentsMap: { [key: number]: Comment[] } = {
      1: [
        {
          commentId: 101,
          username: 'Traveler_Kim',
          content: 'I love this story! I celebrate Mid-Autumn Festival every year with my family.',
          isLiked: false,
          datePublished: '2024-09-15T10:30:00',
          isDeleted: false,
          replies: [
            {
              commentId: 102,
              username: 'CulturalExplorer',
              content: 'That\'s wonderful! Thanks for sharing!',
              isLiked: true,
              datePublished: '2024-09-15T11:45:00',
              isDeleted: false,
              replies: [],
              showReplies: false
            }
          ],
          showReplies: false
        },
        {
          commentId: 103,
          username: 'MoonLover',
          content: 'Chang\'e is such a fascinating figure. I always look for her on the moon.',
          isLiked: false,
          datePublished: '2024-09-16T09:20:00',
          isDeleted: false,
          replies: [],
          showReplies: false
        }
      ],
      5: [
        {
          commentId: 301,
          username: 'RiddleSolver',
          content: 'Is it bamboo? That makes so much sense!',
          isLiked: true,
          datePublished: '2024-10-05T19:00:00',
          isDeleted: false,
          replies: [],
          showReplies: false
        }
      ],
      6: [
        {
          commentId: 401,
          username: 'WisdomSeeker',
          content: 'This proverb speaks deeply to me. Perfection isn\'t everything.',
          isLiked: false,
          datePublished: '2024-10-03T16:45:00',
          isDeleted: false,
          replies: [],
          showReplies: false
        }
      ],
      7: [
        {
          commentId: 501,
          username: 'AudioLover',
          content: 'The audio makes this riddle even more enjoyable!',
          isLiked: false,
          datePublished: '2024-10-10T14:30:00',
          isDeleted: false,
          replies: [],
          showReplies: false
        }
      ]
    };
    return commentsMap[postId] || [];
  }

  filterPosts(): void {
    this.filteredPosts = this.postsList.filter(post => {
      const matchesType = post.type === this.currentPostType;
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = this.searchTerm === '' ||
        post.title.toLowerCase().includes(searchLower) ||
        (post.content && post.content.toLowerCase().includes(searchLower)) ||
        (post.translation && post.translation.toLowerCase().includes(searchLower));
      return matchesType && matchesSearch;
    });
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
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
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    if (start > 1) pages.push(1);
    if (start > 2) pages.push(-1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < this.totalPages - 1) pages.push(-1);
    if (end < this.totalPages) pages.push(this.totalPages);
    return pages;
  }

  previousPage(): void {
    if (this.currentPage > 1) { this.currentPage--; this.cdr.detectChanges(); }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) { this.currentPage++; this.cdr.detectChanges(); }
  }

  goToPage(page: number | -1): void {
    if (page !== -1) { this.currentPage = page; this.cdr.detectChanges(); }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.searchTerm = input.value;
      this.filterPosts();
    }
  }

  selectPostType(type: 'STORY' | 'CULTURE' | 'RIDDLE' | 'PROVERB'): void {
    this.currentPostType = type;
    this.filterPosts();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    this.cdr.detectChanges();
  }

  getPostTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      STORY: 'fa-book-open',
      CULTURE: 'fa-umbrella-beach',
      RIDDLE: 'fa-puzzle-piece',
      PROVERB: 'fa-comment-dots'
    };
    return icons[type] || 'fa-newspaper';
  }

  getPostTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      STORY: 'Story',
      CULTURE: 'Culture',
      RIDDLE: 'Riddle',
      PROVERB: 'Proverb'
    };
    return labels[type] || 'Post';
  }

  openPostCreator(): void {
    this.editingPost = null;
    this.activeLanguageTab = 'native';
    this.newPost = { type: this.currentPostType, title: '', content: '', translation: '', images: [] };
    this.showPostModal = true;
    this.cdr.detectChanges();
  }

  editPost(post: CulturalPost): void {
    this.editingPost = post;
    this.activeLanguageTab = 'native';
    this.newPost = { 
      ...post, 
      images: post.images ? [...post.images] : [],
      video: post.video || undefined,
      videoFile: undefined,
      audio: post.audio || undefined,
      audioUrl: post.audioUrl || undefined,
      audioFile: undefined
    };
    this.showPostModal = true;
    this.cdr.detectChanges();
  }

  closePostCreator(): void {
    this.showPostModal = false;
    this.editingPost = null;
    // Revoke any object URLs to prevent memory leaks
    if (this.newPost.image && this.newPost.image.startsWith('blob:')) {
      URL.revokeObjectURL(this.newPost.image);
    }
    this.cdr.detectChanges();
  }

  publishPost(): void {
    if (!this.validatePost()) return;
    this.isLoading = true;

    if (this.useMockData) {
      setTimeout(() => {
        if (this.editingPost && this.editingPost.postId) {
          const index = this.postsList.findIndex(p => p.postId === this.editingPost!.postId);
          if (index !== -1) {
            this.postsList[index] = { 
              ...this.newPost, 
              postId: this.editingPost.postId,
              likes: this.editingPost.likes || 0,
              isLiked: this.editingPost.isLiked || false,
              commentsCount: this.editingPost.commentsCount || 0
            };
          }
        } else {
          const newId = Math.max(...this.postsList.map(p => p.postId || 0)) + 1;
          this.postsList.push({ 
            ...this.newPost, 
            postId: newId,
            likes: 0,
            isLiked: false,
            commentsCount: 0
          });
        }
        // Switch to the newly created post's type tab
        this.currentPostType = this.newPost.type;
        this.filterPosts();
        this.closePostCreator();
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1000);
    } else {
      const imageFile = this.newPost.imageFile;
      const videoFile = this.newPost.videoFile;
      const audioFile = this.newPost.audioFile;
      
      if (this.editingPost && this.editingPost.postId) {
        this.postService.updatePost(this.editingPost.postId, this.newPost, imageFile, videoFile, audioFile).subscribe({
          next: () => { 
            this.currentPostType = this.newPost.type;
            this.closePostCreator(); 
            this.loadPosts(); 
          },
          error: () => { this.error = 'Failed to update post'; this.isLoading = false; this.cdr.detectChanges(); }
        });
      } else {
        this.postService.addPost(this.newPost, imageFile, videoFile, audioFile).subscribe({
          next: () => { 
            this.currentPostType = this.newPost.type;
            this.closePostCreator(); 
            this.loadPosts(); 
          },
          error: () => { this.error = 'Failed to create post'; this.isLoading = false; this.cdr.detectChanges(); }
        });
      }
    }
  }

  validatePost(): boolean {
    if (!this.newPost.title?.trim()) {
      this.error = 'Please enter a post title';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    // Make content optional - only validate if it's not empty
    // But allow empty string
    if (this.newPost.content === undefined || this.newPost.content === null) {
      this.newPost.content = '';
    }
    if (!this.newPost.translation?.trim()) {
      this.error = 'Please enter English translation';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    if (this.newPost.type === 'RIDDLE' && !this.newPost.riddleAnswer?.trim()) {
      this.error = 'Please enter the riddle answer';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    return true;
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
    post.isLiked = !post.isLiked;
    
    if (post.isLiked) {
      post.likes = (post.likes || 0) + 1;
    } else {
      post.likes = Math.max(0, (post.likes || 0) - 1);
    }
    
    if (post.postId) {
      const index = this.postsList.findIndex(p => p.postId === post.postId);
      if (index !== -1) {
        this.postsList[index] = { ...post };
      }
    }
    
    if (!this.useMockData && post.postId) {
    }
    
    this.cdr.detectChanges();
  }

  getLikeButtonClass(post: CulturalPost): string {
    return post.isLiked ? 'liked' : '';
  }

  openComments(post: CulturalPost): void {
    this.selectedPostForComments = post;
    this.showCommentsModal = true;
    if (this.useMockData) {
      post.commentsList = this.getMockComments(post.postId || 0);
    } else if (post.postId) {
      this.postService.getCommentsByPostId(post.postId).subscribe({
        next: (comments) => {
          if (this.selectedPostForComments) {
            this.selectedPostForComments.commentsList = comments;
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Error loading comments:', err)
      });
    }
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

    if (this.useMockData) {
      const newComment: Comment = {
        commentId: Date.now(),
        username: 'Current User',
        content: this.newComment,
        isLiked: false,
        datePublished: new Date().toISOString(),
        isDeleted: false,
        replies: [],
        showReplies: false
      };
      this.selectedPostForComments.commentsList = this.selectedPostForComments.commentsList || [];
      this.selectedPostForComments.commentsList.push(newComment);
      this.selectedPostForComments.commentsCount = (this.selectedPostForComments.commentsCount || 0) + 1;
      this.newComment = '';
      this.cdr.detectChanges();
    } else if (this.selectedPostForComments.postId) {
      this.postService.addComment({
        postId: this.selectedPostForComments.postId,
        username: localStorage.getItem('username') || 'Unknown User',
        content: this.newComment
      }).subscribe({
        next: () => {
          this.newComment = '';
          if (this.selectedPostForComments?.postId) {
            this.postService.getCommentsByPostId(this.selectedPostForComments.postId).subscribe();
          }
        },
        error: (err) => console.error('Error adding comment:', err)
      });
    }
    this.cdr.detectChanges();
  }

  startReply(comment: Comment): void {
    if (this.replyingTo === comment) {
      this.replyingTo = null;
      this.replyContent = '';
    } else {
      this.replyingTo = comment;
      this.replyContent = '';
    }
    this.cdr.detectChanges();
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyContent = '';
    this.cdr.detectChanges();
  }

  onReplyKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addReply();
    }
  }

  addReply(): void {
    if (!this.replyContent.trim() || !this.selectedPostForComments || !this.replyingTo) return;

    if (this.useMockData) {
      const newReply: Comment = {
        commentId: Date.now(),
        username: 'Current User',
        content: this.replyContent,
        isLiked: false,
        datePublished: new Date().toISOString(),
        isDeleted: false,
        replies: [],
        showReplies: false
      };
      if (!this.replyingTo.replies) this.replyingTo.replies = [];
      this.replyingTo.replies.push(newReply);
      this.replyingTo.showReplies = true;
      this.cancelReply();
      this.cdr.detectChanges();
    } else if (this.selectedPostForComments.postId && this.replyingTo.commentId) {
      this.postService.addReply({
        postId: this.selectedPostForComments.postId,
        username: localStorage.getItem('username') || 'Unknown User',
        content: this.replyContent,
        parentCommentId: this.replyingTo.commentId
      }).subscribe({
        next: () => {
          this.cancelReply();
          if (this.selectedPostForComments?.postId) {
            this.postService.getCommentsByPostId(this.selectedPostForComments.postId).subscribe({
              next: (comments) => {
                if (this.selectedPostForComments) {
                  this.selectedPostForComments.commentsList = comments;
                  this.cdr.detectChanges();
                }
              }
            });
          }
        },
        error: (err) => console.error('Error adding reply:', err)
      });
    }
  }

  toggleReplies(comment: Comment): void {
    comment.showReplies = !comment.showReplies;
    this.cdr.detectChanges();
  }

  likeComment(comment: Comment): void {
    if (!this.useMockData && comment.commentId) {
      this.postService.likeComment(comment.commentId).subscribe({
        error: (err) => console.error('Error liking comment:', err)
      });
    }
    comment.isLiked = !comment.isLiked;
    this.cdr.detectChanges();
  }


  triggerImageUpload(): void {
    this.coverImageInput?.nativeElement.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newPost.imageFile = file;
      this.newPost.image = URL.createObjectURL(file);
      this.cdr.detectChanges();
    }
    if (input) input.value = '';
  }

  triggerGalleryImageUpload(): void {
    this.galleryImageInput?.nativeElement.click();
  }

  onGalleryImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const imageUrl = URL.createObjectURL(file);
      if (!this.newPost.images) this.newPost.images = [];
      this.newPost.images.push(imageUrl);
      if (!this.newPost.galleryImageFiles) this.newPost.galleryImageFiles = [];
      this.newPost.galleryImageFiles.push(file);
      this.cdr.detectChanges();
    }
    if (input) input.value = '';
  }

  triggerVideoUpload(): void {
    this.videoInput?.nativeElement.click();
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newPost.videoFile = file;
      this.newPost.video = URL.createObjectURL(file);
      this.cdr.detectChanges();
    }
    if (input) input.value = '';
  }

  clearVideo(): void {
    if (this.newPost.video && this.newPost.video.startsWith('blob:')) {
      URL.revokeObjectURL(this.newPost.video);
    }
    this.newPost.video = undefined;
    this.newPost.videoFile = undefined;
    this.cdr.detectChanges();
  }

  triggerAudioUpload(): void {
    this.audioInput?.nativeElement.click();
  }

  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newPost.audioFile = file;
      this.newPost.audioUrl = URL.createObjectURL(file);
      this.cdr.detectChanges();
    }
    if (input) input.value = '';
  }

  clearAudio(): void {
    if (this.newPost.audioUrl && this.newPost.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.newPost.audioUrl);
    }
    this.newPost.audioUrl = undefined;
    this.newPost.audioFile = undefined;
    this.cdr.detectChanges();
  }

  removeGalleryImage(index: number): void {
    if (this.newPost.images && this.newPost.images[index]) {
      URL.revokeObjectURL(this.newPost.images[index]);
      this.newPost.images.splice(index, 1);
      if (this.newPost.galleryImageFiles) this.newPost.galleryImageFiles.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  getGalleryImages(post: CulturalPost): string[] {
    if (post.images && post.images.length > 0) return post.images;
    if (post.image) return [post.image];
    return [];
  }

  openImageGallery(images: string[], startIndex: number = 0): void {
    if (images && images.length > 0) {
      this.galleryImages = images;
      this.currentImageIndex = startIndex;
      this.showImageGallery = true;
      this.cdr.detectChanges();
    }
  }

  closeImageGallery(): void {
    this.showImageGallery = false;
    this.galleryImages = [];
    this.currentImageIndex = 0;
    this.cdr.detectChanges();
  }

  nextImage(): void {
    if (this.currentImageIndex < this.galleryImages.length - 1) {
      this.currentImageIndex++;
      this.cdr.detectChanges();
    }
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.cdr.detectChanges();
    }
  }

  clearImage(): void {
    if (this.newPost.image && this.newPost.image.startsWith('blob:')) {
      URL.revokeObjectURL(this.newPost.image);
    }
    this.newPost.image = undefined;
    this.newPost.imageFile = undefined;
    this.cdr.detectChanges();
  }

  toggleTranslation(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const translationText = button.nextElementSibling as HTMLElement;
    if (translationText.style.display === 'none' || !translationText.style.display) {
      translationText.style.display = 'block';
      button.textContent = 'Hide translation';
    } else {
      translationText.style.display = 'none';
      button.textContent = 'See translation';
    }
  }

  retryLoading(): void {
    this.error = '';
    this.loadPosts();
  }
}