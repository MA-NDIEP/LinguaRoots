
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import {environment} from '../../environments/environment';

export interface BackendComment {
  commentId?: number;
  username: string;
  content: string;
  isLiked: boolean;
  datePublished: string;
  isDeleted: boolean;
  dateDeleted?: string;
}


export interface Comment extends BackendComment {
  author?: string;
  date?: string;
  likes?: number;
  replies?: Comment[];
  showReplies?: boolean;
}

export interface BackendPost {
  postId?: number;
  image?: string;
  video?: string;
  title: string;
  content: string;
  translation: string;
  type: 'STORY' | 'CULTURE' | 'VIDEO' | 'AUDIO';
}

export interface CulturalPost extends BackendPost {
  nativeContent?: string;
  englishTranslation?: string;
  coverImageUrl?: string;
  videoUrl?: string;
  author?: string;
  publishedDate?: string;
  likes?: number;
  comments?: number;
  views?: number;
  listens?: number;
  audioUrl?: string;
  audioFile?: File;
  imageFile?: File;
  videoFile?: File;
  commentsList?: Comment[];
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private ApiUrl = environment.ApiUrl;

  private baseUrl = `${this.ApiUrl}/post`;
  private commentBaseUrl = `${this.ApiUrl}/comment`;
  private postsSubject = new BehaviorSubject<CulturalPost[]>([]);
  posts$ = this.postsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<BackendPost[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<BackendPost[]>(`${this.baseUrl}/all`).pipe(
      tap(backendPosts => {
        const uiPosts = backendPosts.map(post => this.convertToUIPost(post));
        this.postsSubject.next(uiPosts);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  addPost(post: CulturalPost, imageFile?: File, videoFile?: File, audioFile?: File): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const formData = new FormData();

    const postData = {
      title: post.title,
      content: post.content || post.nativeContent,
      translation: post.translation || post.englishTranslation,
      type: post.type
    };

    formData.append('post', JSON.stringify(postData));

    if (imageFile) formData.append('image', imageFile);
    if (videoFile) formData.append('video', videoFile);

    return this.http.post(`${this.baseUrl}/add`, formData).pipe(
      tap(() => this.getAllPosts().subscribe()),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  updatePost(postId: number, post: Partial<CulturalPost>, imageFile?: File, videoFile?: File): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const formData = new FormData();

    const postData: any = { postId: postId };
    if (post.title) postData.title = post.title;
    if (post.content) postData.content = post.content;
    if (post.nativeContent) postData.content = post.nativeContent;
    if (post.translation) postData.translation = post.translation;
    if (post.englishTranslation) postData.translation = post.englishTranslation;
    if (post.type) postData.type = post.type;

    formData.append('post', JSON.stringify(postData));

    if (imageFile) formData.append('image', imageFile);
    if (videoFile) formData.append('video', videoFile);

    return this.http.put(`${this.baseUrl}/update`, formData).pipe(
      tap(() => this.getAllPosts().subscribe()),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  deactivatePost(postId: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put(`${this.baseUrl}/deactivate`, { postId }).pipe(
      tap(() => this.getAllPosts().subscribe()),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getCommentsByPostId(postId: number): Observable<BackendComment[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<BackendComment[]>(`${this.commentBaseUrl}/${postId}`).pipe(
      tap(backendComments => {
        const currentPosts = this.postsSubject.value;
        const postIndex = currentPosts.findIndex(p => p.postId === postId);
        if (postIndex !== -1) {
          const uiComments = backendComments.map(c => this.convertToUIComment(c));
          currentPosts[postIndex].commentsList = uiComments;
          this.postsSubject.next([...currentPosts]);
        }
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  addComment(comment: { postId: number; username: string; content: string }): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const commentData = {
      postId: comment.postId,
      username: comment.username,
      content: comment.content
    };

    return this.http.post(`${this.commentBaseUrl}/add`, commentData).pipe(
      tap(() => {
        if (comment.postId) {
          this.getCommentsByPostId(comment.postId).subscribe();
        }
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  updateComment(commentId: number, content: string): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put(`${this.commentBaseUrl}/update`, { commentId, content }).pipe(
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  deleteComment(commentId: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete(`${this.commentBaseUrl}/delete`, { body: { commentId } }).pipe(
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  likeComment(commentId: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post(`${this.commentBaseUrl}/like`, { commentId }).pipe(
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  private convertToUIPost(backendPost: BackendPost): CulturalPost {
    return {
      ...backendPost,
      nativeContent: backendPost.content,
      englishTranslation: backendPost.translation,
      coverImageUrl: backendPost.image,
      videoUrl: backendPost.video,
      author: 'Cultural Explorer',
      publishedDate: this.formatDate(new Date()),
      likes: 0,
      comments: 0,
      commentsList: []
    };
  }

  private convertToUIComment(backendComment: BackendComment): Comment {
    return {
      ...backendComment,
      author: backendComment.username,
      date: this.formatDate(new Date(backendComment.datePublished)),
      likes: 0,
      replies: [],
      showReplies: false
    };
  }

  private formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 7) return date.toLocaleDateString();
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while processing your request.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Cannot connect to the server. Please check if the backend is running.';
          break;
        case 400:
          errorMessage = 'Invalid request. Please check the data you provided.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please login again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Resource not found. Please check the endpoint URL.';
          break;
        case 409:
          errorMessage = 'A post with this title already exists.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Post Service Error:', error);
    this.errorSubject.next(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  refreshPosts(): void {
    this.getAllPosts().subscribe();
  }
}
