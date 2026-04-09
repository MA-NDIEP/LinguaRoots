import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, finalize, map } from 'rxjs/operators';

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
  commentsList?: Comment[];
  audioUrl?: string;
  audioFile?: File;
  imageFile?: File;
  videoFile?: File;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private baseUrl = 'http://localhost:8765/post';
  private commentBaseUrl = 'http://localhost:8765/comment';
  private postsSubject = new BehaviorSubject<CulturalPost[]>([]);
  posts$ = this.postsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<CulturalPost[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<BackendPost[]>(`${this.baseUrl}/all`).pipe(
      map(backendPosts => {
        return backendPosts.map(post => this.convertToUIPost(post));
      }),
      tap(uiPosts => {
        this.postsSubject.next(uiPosts);
      }),
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

    const postData = {
      title: post.title,
      content: post.content,
      translation: post.translation,
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
    if (post.translation) postData.translation = post.translation;
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

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<BackendComment[]>(`${this.commentBaseUrl}/${postId}`).pipe(
      map(backendComments => {
        return backendComments.map(comment => this.convertToUIComment(comment));
      }),
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
      postId: backendPost.postId,
      image: backendPost.image,
      video: backendPost.video,
      title: backendPost.title,
      content: backendPost.content,
      translation: backendPost.translation,
      type: backendPost.type,
      commentsList: []
    };
  }

  private convertToUIComment(backendComment: BackendComment): Comment {
    return {
      commentId: backendComment.commentId,
      username: backendComment.username,
      content: backendComment.content,
      isLiked: backendComment.isLiked,
      datePublished: backendComment.datePublished,
      isDeleted: backendComment.isDeleted,
      dateDeleted: backendComment.dateDeleted,
      replies: [],
      showReplies: false
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
