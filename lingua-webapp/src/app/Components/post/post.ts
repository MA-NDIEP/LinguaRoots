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
  currentPostType: string = 'STORY';
  viewMode: string = 'grid';
  isLoading: boolean = false;
  error: string = '';

  private useMockData: boolean = false;

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

  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  isRecording: boolean = false;
  recordingTime: number = 0;
  recordingInterval: any;

  @ViewChild('coverImageInput') coverImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('audioFileInput') audioFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoFileInput') videoFileInput!: ElementRef<HTMLInputElement>;

  newPost: CulturalPost = {
    type: 'STORY',
    title: '',
    content: '',
    translation: ''
  };

  private subscriptions: Subscription = new Subscription();

  constructor(
    private postService: PostService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Post component initialized');
    console.log('Using mock data:', this.useMockData);

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
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }
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
          console.log('Posts loaded from backend:', posts);
          this.postsList = posts;
          this.filterPosts();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading posts:', err);
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
        content: 'Long ago, ten suns appeared in the sky, scorching the Earth. The hero Hou Yi shot down nine suns, saving humanity. As a reward, he received an elixir of immortality. His beautiful wife Chang\'e drank it to protect it from a greedy apprentice and floated to the moon, where she lives to this day. Every year during the Mid-Autumn Festival, families gather to admire the full moon, eat mooncakes, and remember this tale of love and sacrifice.',
        translation: 'The Mid-Autumn Festival is one of the most important traditional festivals in Chinese culture. Families gather to appreciate the bright full moon, eat mooncakes together, and share stories about Chang\'e, the moon goddess. The round shape of mooncakes symbolizes family reunion and completeness.',
        image: 'https://images.unsplash.com/photo-1535385794809-21f8c11e565f?w=500',
        video: ''
      },
      {
        postId: 2,
        type: 'CULTURE',
        title: 'Thai Silk Weaving Tradition',
        content: 'ศิลปะการทอผ้าไหมไทยมีประวัติศาสตร์ยาวนานกว่าพันปี ชาวไทยในภาคตะวันออกเฉียงเหนือสืบทอดภูมิปัญญานี้จากรุ่นสู่รุ่น กระบวนการผลิตเริ่มจากการเลี้ยงหนอนไหม การปั่นไหม การย้อมสีธรรมชาติจากพืช และการทอด้วยกี่ทอมือ ลวดลายผ้าไหมไทยแต่ละแบบมีความหมายและเรื่องราวเฉพาะตัว สะท้อนถึงวิถีชีวิต ความเชื่อ และความงดงามของวัฒนธรรมไทย',
        translation: 'Thai silk weaving is an ancient art form that has been passed down through generations in northeastern Thailand. The process involves silk worm cultivation, natural dyeing using local plants, and intricate hand-weaving techniques. Each pattern tells a unique story about Thai culture, beliefs, and way of life.',
        image: 'https://images.unsplash.com/photo-1563089146-4d5a5a1d05a2?w=500',
        video: ''
      },
      {
        postId: 3,
        type: 'VIDEO',
        title: 'Traditional Khon Masked Dance',
        content: 'การแสดงโขนเป็นศิลปะการแสดงชั้นสูงของไทย ที่ผสมผสานการเต้นรำ ดนตรี การร้อง และการแสดงท่าทาง เรื่องราวที่แสดงส่วนใหญ่นำมาจากมหากาพย์รามเกียรติ์ ตัวละเอกเช่น พระราม พระลักษมณ์ และทศกัณฐ์ สวมหน้ากากอันงดงามและเครื่องแต่งกายประณีต การแสดงโขนได้รับการขึ้นทะเบียนเป็นมรดกภูมิปัญญาทางวัฒนธรรมของโลกโดย UNESCO',
        translation: 'Khon is a traditional Thai masked dance drama that combines dance, music, singing, and elaborate gestures. The performances are based on the Ramakian epic, the Thai version of the Ramayana. UNESCO recognized Khon as an Intangible Cultural Heritage of Humanity in 2018.',
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500',
        video: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
      },
      {
        postId: 4,
        type: 'AUDIO',
        title: 'The Legend of the Naga',
        content: 'ในตำนานลาวและไทย เชื่อว่ามีพญานาคอาศัยอยู่ในแม่น้ำโขง สิ่งมีชีวิตในตำนานนี้มีรูปร่างคล้ายงูใหญ่ สามารถแปลงกายเป็นมนุษย์ได้ ชาวบ้านริมแม่น้ำโขงเล่าขานเรื่องราวเกี่ยวกับพญานาคมาหลายชั่วอายุคน รวมถึงปรากฏการณ์ลูกไฟพญานาคที่พวยพุ่งขึ้นจากแม่น้ำในช่วงออกพรรษา',
        translation: 'In Lao and Thai mythology, the Naga is a mythical serpent believed to inhabit the Mekong River. These legendary creatures can transform between snake and human form. Riverside communities have passed down stories about the Naga for generations, including the mysterious Naga fireballs.',
        image: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=500',
        video: '',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      },
      {
        postId: 5,
        type: 'STORY',
        title: 'The Spirit of Songkran',
        content: 'สงกรานต์เป็นปีใหม่ไทย ซึ่งจัดขึ้นในช่วงเดือนเมษายน เป็นช่วงเวลาแห่งการเฉลิมฉลอง การทำบุญ และการรดน้ำขอพรจากผู้ใหญ่ ผู้คนกลับบ้านเกิดเพื่อพบปะครอบครัว มีการละเล่นพื้นบ้าน การก่อเจดีย์ทราย และการปล่อยนกปล่อยปลา เพื่อความเป็นสิริมงคล',
        translation: 'Songkran is the Thai New Year festival celebrated in April. It\'s a time for merit-making, paying respect to elders, and family reunions. Traditional activities include building sand pagodas, releasing birds and fish for good luck, and gentle water pouring as a blessing.',
        image: 'https://images.unsplash.com/photo-1559599233-4b8f4d76c1b3?w=500',
        video: ''
      },
      {
        postId: 6,
        type: 'CULTURE',
        title: 'Balinese Offering Traditions',
        content: 'Di Bali, sesajen atau canang sari adalah bagian penting dari kehidupan sehari-hari. Setiap pagi, umat Hindu Bali membuat sesajen kecil dari daun kelapa yang diisi dengan bunga-bunga berwarna-warni, beras, dan kemenyan.',
        translation: 'In Bali, daily offerings called canang sari are an essential part of Hindu tradition. These small palm leaf trays are filled with colorful flowers, rice, and incense. Each offering represents gratitude to the gods.',
        image: 'https://images.unsplash.com/photo-1554714842-9cda1b5f9c86?w=500',
        video: ''
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
      2: [
        {
          commentId: 201,
          username: 'SilkArtisan',
          content: 'I learned to weave silk in Khon Kaen. It takes months to make one piece!',
          isLiked: true,
          datePublished: '2024-10-01T14:15:00',
          isDeleted: false,
          replies: [],
          showReplies: false
        }
      ],
      3: [
        {
          commentId: 301,
          username: 'DanceEnthusiast',
          content: 'I saw a Khon performance in Bangkok. The costumes are breathtaking!',
          isLiked: true,
          datePublished: '2024-10-05T19:00:00',
          isDeleted: false,
          replies: [],
          showReplies: false
        }
      ],
      4: [
        {
          commentId: 401,
          username: 'MythologyBuff',
          content: 'The Naga fireballs are fascinating! Scientists still can\'t fully explain them.',
          isLiked: false,
          datePublished: '2024-10-03T16:45:00',
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

    let defaultType: 'STORY' | 'CULTURE' | 'VIDEO' | 'AUDIO' = 'STORY';
    if (this.currentPostType === 'STORY' || this.currentPostType === 'CULTURE' ||
        this.currentPostType === 'VIDEO' || this.currentPostType === 'AUDIO') {
      defaultType = this.currentPostType as 'STORY' | 'CULTURE' | 'VIDEO' | 'AUDIO';
    }

    this.newPost = {
      type: defaultType,
      title: '',
      content: '',
      translation: ''
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

    this.isLoading = true;

    if (this.useMockData) {
      setTimeout(() => {
        if (this.editingPost && this.editingPost.postId) {
          const index = this.postsList.findIndex(p => p.postId === this.editingPost!.postId);
          if (index !== -1) {
            this.postsList[index] = { ...this.newPost, postId: this.editingPost.postId };
          }
        } else {
          const newId = Math.max(...this.postsList.map(p => p.postId || 0)) + 1;
          this.postsList.push({ ...this.newPost, postId: newId });
        }
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
        console.log("Existing post being updated:", this.newPost);
        this.postService.updatePost(this.editingPost.postId, this.newPost, imageFile, videoFile, audioFile).subscribe({
          next: () => {
            this.closePostCreator();
            this.loadPosts();
          },
          error: (err) => {
            this.error = 'Failed to update post';
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.postService.addPost(this.newPost, imageFile, videoFile, audioFile).subscribe({
          next: () => {
            this.closePostCreator();
            this.loadPosts();
          },
          error: (err) => {
            this.error = 'Failed to create post';
            this.isLoading = false;
            this.cdr.detectChanges();
          }
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

    if (this.activeLanguageTab === 'native' && !this.newPost.content?.trim()) {
      this.error = 'Please enter native language content';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    if (this.activeLanguageTab === 'english' && !this.newPost.translation?.trim()) {
      this.error = 'Please enter English translation';
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
    console.log('Like post:', post.postId);
    this.cdr.detectChanges();
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

      this.replyingTo.replies = this.replyingTo.replies || [];
      this.replyingTo.replies.push(newReply);
      this.cancelReply();
      this.cdr.detectChanges();
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
    this.newPost.image = undefined;
    this.newPost.imageFile = undefined;
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
    this.newPost.video = undefined;
    this.newPost.videoFile = undefined;
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
    const button = event.currentTarget as HTMLElement;
    const translationText = button.previousElementSibling as HTMLElement;

    if (translationText.style.display === 'none') {
      translationText.style.display = 'inline';
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
