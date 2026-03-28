// dashboard.component.ts
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SidebarComponent } from '../side-bar/side-bar';
import { NavbarComponent } from '../nav-bar/nav-bar';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

interface Comment {
  id: number;
  userName: string;
  userRole: 'student' | 'admin' | 'teacher';
  avatarColor: string;
  icon: string;
  action: string;
  postTitle: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  isApproved: boolean;
  type: 'comment' | 'review' | 'mention';
}

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, NavbarComponent, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  // Stats Data
  totalStudents: number = 1284;
  totalAdmins: number = 24;
  totalLessons: number = 342;
  totalPosts: number = 1027;
  
  // Notification filter
  notificationFilter: string = 'all';
  
  // Reply functionality
  showReplyBox: boolean = false;
  replyingTo: Comment | null = null;
  replyMessage: string = '';
  
  // Comments and notifications data
  comments: Comment[] = [
    {
      id: 1,
      userName: 'Sarah Johnson',
      userRole: 'student',
      avatarColor: '#e3f2fd',
      icon: 'fas fa-user-graduate',
      action: 'commented on post',
      postTitle: 'Understanding Thai Tones',
      message: 'This is really helpful! The examples make it so much easier to understand the different tones.',
      timeAgo: '5 minutes ago',
      isRead: false,
      isApproved: true,
      type: 'comment'
    },
    {
      id: 2,
      userName: 'Michael Chen',
      userRole: 'teacher',
      avatarColor: '#e8f5e9',
      icon: 'fas fa-chalkboard-teacher',
      action: 'reviewed lesson',
      postTitle: 'Basic Greetings in Thai',
      message: 'Great lesson content! The pronunciation guide is very accurate. Would suggest adding more practice exercises.',
      timeAgo: '1 hour ago',
      isRead: false,
      isApproved: false,
      type: 'review'
    },
    {
      id: 3,
      userName: 'Emma Watson',
      userRole: 'student',
      avatarColor: '#fff3e0',
      icon: 'fas fa-user-graduate',
      action: 'mentioned you in comment',
      postTitle: 'Thai Alphabet: Gor Gai',
      message: '@admin This lesson helped me finally understand the alphabet! Thank you so much!',
      timeAgo: '3 hours ago',
      isRead: true,
      isApproved: true,
      type: 'mention'
    },
    {
      id: 4,
      userName: 'David Kim',
      userRole: 'student',
      avatarColor: '#f3e5f5',
      icon: 'fas fa-user-graduate',
      action: 'commented on post',
      postTitle: 'Numbers 1-100 in Thai',
      message: 'The audio examples are very clear. Would love to see more practice quizzes!',
      timeAgo: '5 hours ago',
      isRead: true,
      isApproved: true,
      type: 'comment'
    },
    {
      id: 5,
      userName: 'Lisa Thompson',
      userRole: 'teacher',
      avatarColor: '#e0f2fe',
      icon: 'fas fa-chalkboard-teacher',
      action: 'reviewed lesson',
      postTitle: 'Thai Sentence Structure',
      message: 'Excellent breakdown of sentence patterns. The examples are very practical for daily conversation.',
      timeAgo: 'Yesterday',
      isRead: true,
      isApproved: false,
      type: 'review'
    },
    {
      id: 6,
      userName: 'James Wilson',
      userRole: 'admin',
      avatarColor: '#fef3c7',
      icon: 'fas fa-user-tie',
      action: 'mentioned you in discussion',
      postTitle: 'Platform Improvement Suggestions',
      message: '@admin @developer Can we add dark mode support? Many users are requesting this feature.',
      timeAgo: 'Yesterday',
      isRead: false,
      isApproved: true,
      type: 'mention'
    }
  ];
  
  get filteredNotifications(): Comment[] {
    if (this.notificationFilter === 'all') {
      return this.comments;
    }
    return this.comments.filter(comment => comment.type === this.notificationFilter);
  }
  
  private enrollmentChart: Chart | undefined;
  private contentChart: Chart | undefined;
  
  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initEnrollmentChart();
      this.initContentChart();
    }, 100);
  }
  
  ngOnDestroy(): void {
    if (this.enrollmentChart) {
      this.enrollmentChart.destroy();
    }
    if (this.contentChart) {
      this.contentChart.destroy();
    }
  }
  
  loadDashboardData(): void {
    console.log('Loading dashboard data...');
  }
  
  refreshData(): void {
    console.log('Refreshing data...');
    // You would call your API service here
  }
  
  setNotificationFilter(filter: string): void {
    this.notificationFilter = filter;
  }
  
  replyToComment(comment: Comment): void {
    this.replyingTo = comment;
    this.showReplyBox = true;
    this.replyMessage = '';
  }
  
  closeReplyBox(): void {
    this.showReplyBox = false;
    this.replyingTo = null;
    this.replyMessage = '';
  }
  
  sendReply(): void {
    if (this.replyMessage.trim() && this.replyingTo) {
      console.log(`Sending reply to ${this.replyingTo.userName}: ${this.replyMessage}`);
      // Here you would call your API to send the reply
      alert(`Reply sent to ${this.replyingTo.userName}!`);
      this.closeReplyBox();
      
      // Mark the comment as read if it wasn't
      if (!this.replyingTo.isRead) {
        this.replyingTo.isRead = true;
      }
    }
  }
  
  approveComment(comment: Comment): void {
    comment.isApproved = true;
    console.log(`Approved comment from ${comment.userName}`);
    // Here you would call your API to approve the comment
  }
  
  deleteComment(comment: Comment): void {
    if (confirm(`Are you sure you want to delete this comment from ${comment.userName}?`)) {
      const index = this.comments.indexOf(comment);
      if (index > -1) {
        this.comments.splice(index, 1);
        console.log(`Deleted comment from ${comment.userName}`);
      }
    }
  }
  
  viewAllComments(): void {
    console.log('Viewing all comments');
    // Navigate to comments management page
  }
  
  updateMetrics(event: Event): void {
    const select = event.target as HTMLSelectElement;
    console.log(`Updating metrics for period: ${select.value}`);
  }
  
  private initEnrollmentChart(): void {
    const canvas = document.getElementById('enrollmentChart') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        this.enrollmentChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'New Students',
                data: [65, 78, 89, 102, 135, 148],
                borderColor: '#779D28',
                backgroundColor: 'rgba(119, 157, 40, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#779D28',
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 3,
              },
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
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#21443D',
                titleColor: '#fff',
                bodyColor: '#e0e8d6',
                padding: 10,
                cornerRadius: 8,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: '#e2e8f0',
                },
                ticks: {
                  stepSize: 30,
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: {
                    size: 12,
                  },
                },
              },
            },
          },
        });
      }
    }
  }
  
  private initContentChart(): void {
    const canvas = document.getElementById('contentChart') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        this.contentChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Lessons',
                data: [28, 32, 35, 42, 38, 45],
                backgroundColor: '#779D28',
                borderRadius: 8,
                barPercentage: 0.65,
                categoryPercentage: 0.8,
              },
              {
                label: 'Posts',
                data: [42, 48, 55, 62, 58, 70],
                backgroundColor: '#21443D',
                borderRadius: 8,
                barPercentage: 0.65,
                categoryPercentage: 0.8,
              },
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
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                backgroundColor: '#21443D',
                titleColor: '#fff',
                bodyColor: '#e0e8d6',
                padding: 10,
                cornerRadius: 8,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: '#e2e8f0',
                },
                ticks: {
                  stepSize: 15,
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: {
                    size: 12,
                  },
                },
              },
            },
          },
        });
      }
    }
  }
}