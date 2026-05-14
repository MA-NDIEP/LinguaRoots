// dashboard.component.ts
import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { SidebarComponent } from '../side-bar/side-bar';
import { NavbarComponent } from '../nav-bar/nav-bar';
import { PostService, Comment } from '../../Services/post';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import {StudentService} from '../../Services/student';
import {LessonService} from '../../Services/lesson';
import {AdminService} from '../../Services/admin';

Chart.register(...registerables);

interface DashboardComment extends Comment {
  postId: number;
  postTitle?: string;
  isRead: boolean;
  timeAgo?: string;
}

interface RecentLike {
  id: number;
  username: string;
  postId: number;
  likedAt: string;
  type: 'post' | 'comment';
  targetId: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {

  useMockData: boolean = false;
  totalStudents: number = 0;
  totalAdmins: number = 0;
  totalLessons: number = 0;
  totalPosts: number = 0;
  activeTab: 'comments' | 'likes' = 'comments';
  commentFilter: string = 'all';
  isLoading: boolean = true;
  errorMessage: string | null = null;
  allComments: DashboardComment[] = [];
  recentLikes: RecentLike[] = [];

  postsMap: Map<number, { title: string; content: string; type: string }> = new Map();

  private subscriptions: Subscription[] = [];

  private enrollmentChart: Chart | undefined;
  private contentChart: Chart | undefined;

  constructor(
    private postService: PostService,
    private studentService: StudentService,
    private lessonService: LessonService,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatTimeAgo(dateString: string): string {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }

  get filteredComments(): DashboardComment[] {
    let filtered = [...this.allComments];
    if (this.commentFilter === 'unread') {
      filtered = filtered.filter(comment => !comment.isRead && !comment.isDeleted);
    }
    return filtered.sort((a, b) =>
      new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
    );
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initEnrollmentChart();
      this.loadEnrollmentStatistics();
      this.initContentChart();
      this.loadContentStatistics();
      this.loadStatistics();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.enrollmentChart) this.enrollmentChart.destroy();
    if (this.contentChart) this.contentChart.destroy();
  }

  loadAllData(): void {
    if (this.useMockData) {
      this.loadMockData();
    } else {
      this.loadRealData();
      this.loadStatistics();
    }
  }

  loadMockData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.allComments = [];
    this.recentLikes = [];
    this.postsMap.clear();

    const mockPosts = [
      { postId: 1, title: 'Understanding Thai Tones', content: 'Thai has 5 tones: mid, low, falling, high, rising...', type: 'STORY' },
      { postId: 2, title: 'Basic Greetings in Thai', content: 'Sawasdee (Hello), Khob khun (Thank you)...', type: 'CULTURE' },
      { postId: 3, title: 'Thai Alphabet: Gor Gai', content: 'ก (Gor Gai) is the first letter of the Thai alphabet...', type: 'VIDEO' },
      { postId: 4, title: 'Numbers 1-100 in Thai', content: '1 = neung, 2 = song, 3 = sam...', type: 'AUDIO' },
      { postId: 5, title: 'Thai Sentence Structure', content: 'Subject + Verb + Object like English...', type: 'STORY' },
      { postId: 6, title: 'Platform Improvement Suggestions', content: 'Dark mode, better search, offline mode...', type: 'CULTURE' },
    ];

    mockPosts.forEach(post => {
      this.postsMap.set(post.postId, { title: post.title, content: post.content, type: post.type });
    });
    this.totalPosts = mockPosts.length;

    this.allComments = [
      {
        commentId: 1,
        username: 'Sarah Johnson',
        content: 'This is really helpful! The examples make it so much easier to understand the different tones.',
        isLiked: true,
        datePublished: new Date(Date.now() - 5 * 60000).toISOString(),
        isDeleted: false,
        postId: 1,
        postTitle: 'Understanding Thai Tones',
        isRead: false,
        timeAgo: '5 minutes ago'
      },
      {
        commentId: 2,
        username: 'Michael Chen',
        content: 'Great lesson content! The pronunciation guide is very accurate. Would suggest adding more practice exercises.',
        isLiked: false,
        datePublished: new Date(Date.now() - 60 * 60000).toISOString(),
        isDeleted: false,
        postId: 2,
        postTitle: 'Basic Greetings in Thai',
        isRead: false,
        timeAgo: '1 hour ago'
      },
      {
        commentId: 3,
        username: 'Emma Watson',
        content: 'This lesson helped me finally understand the alphabet! Thank you so much!',
        isLiked: true,
        datePublished: new Date(Date.now() - 180 * 60000).toISOString(),
        isDeleted: false,
        postId: 3,
        postTitle: 'Thai Alphabet: Gor Gai',
        isRead: true,
        timeAgo: '3 hours ago'
      },
      {
        commentId: 4,
        username: 'David Kim',
        content: 'The audio examples are very clear. Would love to see more practice quizzes!',
        isLiked: false,
        datePublished: new Date(Date.now() - 300 * 60000).toISOString(),
        isDeleted: false,
        postId: 4,
        postTitle: 'Numbers 1-100 in Thai',
        isRead: true,
        timeAgo: '5 hours ago'
      },
      {
        commentId: 5,
        username: 'Lisa Thompson',
        content: 'Excellent breakdown of sentence patterns. The examples are very practical for daily conversation.',
        isLiked: true,
        datePublished: new Date(Date.now() - 86400000).toISOString(),
        isDeleted: false,
        postId: 5,
        postTitle: 'Thai Sentence Structure',
        isRead: true,
        timeAgo: 'Yesterday'
      },
      {
        commentId: 6,
        username: 'James Wilson',
        content: 'Can we add dark mode support? Many users are requesting this feature.',
        isLiked: true,
        datePublished: new Date(Date.now() - 86400000).toISOString(),
        isDeleted: false,
        postId: 6,
        postTitle: 'Platform Improvement Suggestions',
        isRead: false,
        timeAgo: 'Yesterday'
      },
      {
        commentId: 7,
        username: 'Priya Patel',
        content: 'I love how the lessons are structured. Very easy to follow!',
        isLiked: false,
        datePublished: new Date(Date.now() - 2 * 86400000).toISOString(),
        isDeleted: false,
        postId: 1,
        postTitle: 'Understanding Thai Tones',
        isRead: true,
        timeAgo: '2 days ago'
      },
      {
        commentId: 8,
        username: 'Carlos Rodriguez',
        content: 'The pronunciation audio is crystal clear. This really helps with learning.',
        isLiked: true,
        datePublished: new Date(Date.now() - 2 * 86400000).toISOString(),
        isDeleted: false,
        postId: 4,
        postTitle: 'Numbers 1-100 in Thai',
        isRead: true,
        timeAgo: '2 days ago'
      }
    ];

    this.recentLikes = this.allComments
      .filter(comment => comment.isLiked && !comment.isDeleted)
      .map(comment => ({
        id: comment.commentId || 0,
        username: comment.username,
        postId: comment.postId,
        likedAt: comment.datePublished,
        type: 'comment' as const,
        targetId: comment.commentId || 0
      }));

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  loadRealData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const sub = this.postService.getAllPosts().subscribe({
      next: (posts) => {
        posts.forEach(post => {
          if (post.postId) {
            this.postsMap.set(post.postId, { title: post.title, content: post.content, type: post.type });
          }
        });
        this.totalPosts = posts.length;
        this.loadRealCommentsAndLikes(posts);
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.errorMessage = 'Failed to load posts. Please check your internet connection.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(sub);
  }

  loadRealCommentsAndLikes(posts: any[]): void {
    const commentObservables = posts.map(post => {
      if (post.postId) {
        return this.postService.getCommentsByPostId(post.postId!).pipe(
          catchError(() => of([]))
        );
      }
      return of([]);
    });

    const sub = forkJoin(commentObservables).subscribe({
      next: (allCommentsArrays) => {
        this.allComments = [];
        this.recentLikes = [];

        allCommentsArrays.forEach((comments, index) => {
          const post = posts[index];
          if (post && post.postId && comments) {
            comments.forEach((comment: Comment) => {
              if (!comment.isDeleted) {
                this.allComments.push({
                  ...comment,
                  postId: post.postId,
                  postTitle: post.title,
                  isRead: comment.isRead,
                  timeAgo: this.formatTimeAgo(comment.datePublished)
                });
              }
              if (comment.isLiked && !comment.isDeleted) {
                this.recentLikes.push({
                  id: comment.commentId || Date.now() + index,
                  username: comment.username,
                  postId: post.postId,
                  likedAt: comment.datePublished,
                  type: 'comment',
                  targetId: comment.commentId || 0
                });
              }
            });
          }
        });

        this.allComments.sort((a, b) =>
          new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
        );
        this.recentLikes.sort((a, b) =>
          new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime()
        );

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.errorMessage = 'Failed to load comments. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(sub);
  }

  getPostTitle(postId: number): string {
    const post = this.postsMap.get(postId);
    return post ? post.title : `Post #${postId}`;
  }

  getPostPreview(postId: number): string {
    const post = this.postsMap.get(postId);
    return post ? post.content : '';
  }

  getUserRole(username: string): 'student' | 'admin' | 'teacher' {
    if (username.toLowerCase().includes('admin')) return 'admin';
    if (username.toLowerCase().includes('teacher')) return 'teacher';
    if (username.toLowerCase().includes('michael')) return 'teacher';
    if (username.toLowerCase().includes('james')) return 'admin';
    return 'student';
  }

  refreshData(): void {
    this.loadAllData();
  }

  setActiveTab(tab: 'comments' | 'likes'): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  setCommentFilter(filter: string): void {
    this.commentFilter = filter;
    this.cdr.detectChanges();
  }

  viewAll(): void {
    this.router.navigate(['/posts']);
  }

  retryLoad(): void {
    this.loadAllData();
  }

  navigateToPostAndRead(postId: number, commentId: number): void {
    this.postService.readComment(commentId).subscribe({
      next: (response) => console.log('Success:', response),
      error: (err) => console.error('Caught error:', err)
    });
    this.router.navigate(['/posts'], { queryParams: { id: postId } });
  }

  navigateToPost(postId: number): void {
    this.router.navigate(['/posts'], { queryParams: { id: postId } });
  }

  private initEnrollmentChart(): void {

    const canvas = document.getElementById('enrollmentChart') as HTMLCanvasElement;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    this.enrollmentChart = new Chart(ctx, {

      type: 'line',

      data: {

        labels: [],

        datasets: [{
          label: 'New Students',
          data: [],
          borderColor: '#779D28',
          backgroundColor: 'rgba(119, 157, 40, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#779D28',
          pointBorderColor: '#fff',
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 3,
        }],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { size: 12 }
            }
          },

          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#21443D',
            titleColor: '#fff',
            bodyColor: '#e0e8d6',
            padding: 10,
            cornerRadius: 8
          },
        },

        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#e2e8f0' },
            ticks: { stepSize: 30 }
          },

          x: {
            grid: { display: false },
            ticks: { font: { size: 12 } }
          },
        },
      },
    });
  }

  private loadEnrollmentStatistics(): void {

    this.studentService.getEnrollmentStatistics()
      .subscribe({

        next: (response) => {

          if (!this.enrollmentChart) return;

          this.enrollmentChart.data.labels = response.labels;

          this.enrollmentChart.data.datasets[0].data = response.values;

          this.enrollmentChart.update();
        },

        error: (error) => {
          console.error('Error loading chart data', error);
        }
      });
  }

  private initContentChart(): void {

    const canvas = document.getElementById('contentChart') as HTMLCanvasElement;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    this.contentChart = new Chart(ctx, {

      type: 'bar',

      data: {

        labels: [],

        datasets: [
          {
            label: 'Lessons',
            data: [],
            backgroundColor: '#779D28',
            borderRadius: 8,
            barPercentage: 0.65,
            categoryPercentage: 0.8,
          },
          {
            label: 'Posts',
            data: [],
            backgroundColor: '#21443D',
            borderRadius: 8,
            barPercentage: 0.65,
            categoryPercentage: 0.8,
          }
        ],
      },

      options: {

        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { size: 12 }
            }
          },

          tooltip: {
            backgroundColor: '#21443D',
            titleColor: '#fff',
            bodyColor: '#e0e8d6',
            padding: 10,
            cornerRadius: 8
          },
        },

        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#e2e8f0' },
            ticks: { stepSize: 15 }
          },

          x: {
            grid: { display: false },
            ticks: { font: { size: 12 } }
          },
        },
      },
    });
  }

  private loadContentStatistics(): void {

    this.postService.getContentStatistics()
      .subscribe({

        next: (response) => {

          if (!this.contentChart) return;

          // X-axis labels (months)
          this.contentChart.data.labels = response.labels;
          this.contentChart.data.datasets[0].data = response.lessons;
          this.contentChart.data.datasets[1].data = response.posts;

          // Refresh chart
          this.contentChart.update();
        },

        error: (error) => {
          console.error('Error loading content chart data', error);
        }
      });
  }

  private loadStatistics(): void {
    this.adminService.getAllAdmins().subscribe({
      next: (admins) => {
        this.totalAdmins = admins.length;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load admins:', error);
        this.cdr.detectChanges();
      }
    });

    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        this.totalStudents = students.length;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load students:', error);
      }
    });

    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        this.totalPosts = posts.length;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.errorMessage = 'Failed to load posts. Please check your internet connection.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.lessonService.getAllLessons().subscribe({
      next: (lessons) => {
        if (lessons) {
          this.totalLessons = lessons.length;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load lessons:', error);
        this.cdr.detectChanges();
      }
    });
  }
}
