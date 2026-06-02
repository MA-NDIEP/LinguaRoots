import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, finalize, map } from 'rxjs/operators';
import {environment} from '../../environments/environment';

export interface BackendComment {
  commentId?: number;
  username: string;
  content: string;
  isLiked: boolean;
  datePublished: string;
  isDeleted: boolean;
  isRead: boolean;
}

export interface Comment extends BackendComment {
  replies?: Comment[];
  showReplies?: boolean;
}

export interface BackendPost {
  postId?: number;
  image?: string;
  video?: string;
  audio?: string;
  title: string;
  content: string;
  translation: string;
  type: 'STORY' | 'CULTURE' | 'RIDDLE' | 'PROVERB';
  riddleAnswer?: string;
  images?: string[];
  galleryImages?: string[];
  likes?: number;
  isLiked?: boolean;
  commentsCount?: number;
  isPublished?: boolean;
}

export interface CulturalPost extends BackendPost {
  commentsList?: Comment[];
  // File objects for upload (temporary, not stored in backend)
  audioFile?: File;
  imageFile?: File;
  videoFile?: File;
  galleryImageFiles?: File[];
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private ApiUrl = environment.ApiUrl;
  private baseUrl = `${this.ApiUrl}/post`;
  private commentBaseUrl = `${this.ApiUrl}/comment`;
  private replyBaseUrl = `${this.ApiUrl}/reply`;
  private likeBaseUrl = `${this.ApiUrl}/like`;

  private postsSubject = new BehaviorSubject<CulturalPost[]>([]);
  posts$ = this.postsSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  private readonly KEY = 'anonId';

  getAnonymousId(): string {
    let anonId = localStorage.getItem(this.KEY);
    if (!anonId) {
      anonId = crypto.randomUUID();
      localStorage.setItem(this.KEY, anonId);
    }
    return anonId;
  }

  getAllPosts(): Observable<CulturalPost[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<BackendPost[]>(`${this.baseUrl}/admin/all`).pipe(
      map(backendPosts => backendPosts.map(post => this.convertToUIPost(post))),
      tap(uiPosts => this.postsSubject.next(uiPosts)),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getPostById(postId: number): Observable<CulturalPost> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<BackendPost>(`${this.baseUrl}/${postId}`).pipe(
      map(backendPost => this.convertToUIPost(backendPost)),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  addPost(post: CulturalPost, imageFile?: File, videoFile?: File, audioFile?: File): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const formData = new FormData();

    formData.append('title', post.title);
    formData.append('content', post.content || '');
    formData.append('translation', post.translation);
    formData.append('type', post.type);

    if (post.type === 'RIDDLE' && post.riddleAnswer) {
      formData.append('riddleAnswer', post.riddleAnswer);
    }

    // Always add cover image if provided
    if (imageFile) formData.append('image', imageFile);

    if (post.galleryImageFiles && post.galleryImageFiles.length > 0) {
      post.galleryImageFiles.forEach((file: File) => {
        formData.append('galleryImageFiles', file);
      });
    }

    // Add video file if provided
    if (videoFile) formData.append('video', videoFile);

    // Add audio file if provided
    if (audioFile) formData.append('audio', audioFile);

    return this.http.post(`${this.baseUrl}/add`, formData).pipe(
      tap(() => this.getAllPosts().subscribe()),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  updatePost(postId: number, post: Partial<CulturalPost>, imageFile?: File, videoFile?: File, audioFile?: File): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const formData = new FormData();
    formData.append('postId', postId.toString());

    if (post.title) formData.append('title', post.title);
    if (post.content !== undefined) formData.append('content', post.content || '');
    if (post.translation) formData.append('translation', post.translation);
    if (post.type) formData.append('type', post.type);

    if (post.type === 'RIDDLE' && post.riddleAnswer) {
      formData.append('riddleAnswer', post.riddleAnswer);
    }

    if (post.type === 'STORY' && post.images && post.images.length > 0) {
      formData.append('existingImages', JSON.stringify(post.images));
    }

    if (post.galleryImageFiles && post.galleryImageFiles.length > 0) {
      post.galleryImageFiles.forEach((file: File) => {
        formData.append('galleryImageFiles', file);
      });
    }

    // Handle cover image - ALWAYS include if provided
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (post.image && !post.image.startsWith('blob:')) {
      formData.append('existingImage', post.image);
    }

    // Handle video - use videoFile if new, otherwise keep existing
    if (videoFile) {
      formData.append('video', videoFile);
    } else if (post.video && !post.video.startsWith('blob:')) {
      formData.append('existingVideo', post.video);
    }

    // Handle audio - use audioFile if new, otherwise keep existing
    if (audioFile) {
      formData.append('audio', audioFile);
    } else if (post.audio && !post.audio.startsWith('blob:')) {
      formData.append('existingAudio', post.audio);
    }

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

  togglePublishStatus(postId: number, action: 'publish' | 'unpublish'): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.http.delete(`${this.baseUrl}/delete/${postId}`).pipe(
      tap(() => this.getAllPosts().subscribe()),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Comment[]>(`${this.commentBaseUrl}/${postId}`).pipe(
      map(backendComments => backendComments.map(comment => this.convertToUIComment(comment))),
      tap(uiComments => {
        const currentPosts = this.postsSubject.value;
        const postIndex = currentPosts.findIndex(p => p.postId === postId);
        if (postIndex !== -1) {
          currentPosts[postIndex].commentsList = uiComments;
          this.postsSubject.next([...currentPosts]);
        }
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  readComment(commentId: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.http.post(`${this.commentBaseUrl}/read/${commentId}`, {}).pipe(
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  addComment(comment: { postId: number; username: string; content: string; parentCommentId?: number }): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const commentData: any = {
      postId: comment.postId,
      username: comment.username,
      content: comment.content
    };

    if (comment.parentCommentId) {
      commentData.parentCommentId = comment.parentCommentId;
    }

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

  addReply(comment: { postId: number; username: string; content: string; parentCommentId: number }): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const replyData = {
      postId: comment.postId,
      username: comment.username,
      content: comment.content,
      commentId: comment.parentCommentId
    };

    return this.http.post(`${this.replyBaseUrl}/add`, replyData).pipe(
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

  likeReply(id: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.http.post(`${this.replyBaseUrl}/like/${id}`, {}).pipe(
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  likePost(postId: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    const anonymousId = this.getAnonymousId();

    return this.http.post(`${this.likeBaseUrl}/like`, {
      postId: postId,
      userId: localStorage.getItem("userId"),
      anonymousId: anonymousId
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  unlikePost(postId: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    const anonymousId = this.getAnonymousId();

    return this.http.post(`${this.likeBaseUrl}/unlike`, {
      postId: postId,
      userId: localStorage.getItem("userId"),
      anonymousId: anonymousId
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getLikes(postId: number) {
    const anonId = this.getAnonymousId();
    return this.http.get(`${this.likeBaseUrl}/${postId}?userId=${anonId}&anonymousId=${anonId}`);
  }

  getContentStatistics(): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.http.get(`${this.baseUrl}/stats/content`);
  }

  private convertToUIPost(backendPost: BackendPost): CulturalPost {
    return {
      postId: backendPost.postId,
      image: backendPost.image,
      video: backendPost.video,
      audio: backendPost.audio,
      title: backendPost.title,
      content: backendPost.content || '',
      translation: backendPost.translation,
      type: backendPost.type,
      riddleAnswer: backendPost.riddleAnswer,
      images: backendPost.galleryImages || (backendPost.image ? [backendPost.image] : []),
      galleryImages: backendPost.galleryImages || [],
      commentsList: [],
      commentsCount: backendPost.commentsCount || 0,
      likes: backendPost.likes || 0,
      isLiked: backendPost.isLiked || false,
      isPublished: backendPost.isPublished,
    };
  }

  private convertToUIComment(backendComment: Comment): Comment {
    return {
      commentId: backendComment.commentId,
      username: backendComment.username,
      content: backendComment.content,
      isLiked: backendComment.isLiked,
      datePublished: backendComment.datePublished,
      isDeleted: backendComment.isDeleted,
      replies: backendComment.replies ? backendComment.replies.map(r => this.convertToUIComment(r)) : [],
      isRead: backendComment.isRead,
      showReplies: true
    };
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
          errorMessage = 'Resource not found.';
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
