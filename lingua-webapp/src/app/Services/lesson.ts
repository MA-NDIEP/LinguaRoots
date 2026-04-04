
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';

export interface Lesson {
  lessonId?: number;
  type: 'alphabets' | 'numbers' | 'names' | 'syllables';
  title: string;
  content: string;
  writtenPronunciation: string;
  example: string;
  englishEquivalent: string;
  status: 'published' | 'draft';
  audioUrl?: string;
  pronunciation?: File;
  order: number;  
}

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private baseUrl = 'http://localhost:8080/lesson'; 
  private lessonsSubject = new BehaviorSubject<Lesson[]>([]);
  lessons$ = this.lessonsSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllLessons(): Observable<Lesson[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    return this.http.get<Lesson[]>(`${this.baseUrl}/all`).pipe(
      tap(lessons => {
        this.lessonsSubject.next(lessons);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  addLesson(lesson: Lesson, audioFile?: File): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const formData = new FormData();
    
    const lessonData = {
      type: lesson.type,
      title: lesson.title,
      content: lesson.content,
      writtenPronunciation: lesson.writtenPronunciation,
      example: lesson.example,
      englishEquivalent: lesson.englishEquivalent,
      status: lesson.status,
      order: lesson.order  
    };
    
    formData.append('lesson', JSON.stringify(lessonData));
    
    if (audioFile) {
      formData.append('pronunciation', audioFile);
    }
    
    return this.http.post(`${this.baseUrl}/add`, formData).pipe(
      tap(() => {
        this.getAllLessons().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  updateLesson(lessonId: number, lesson: Partial<Lesson>, audioFile?: File): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const formData = new FormData();
    
    const lessonData = {
      lessonId: lessonId,
      type: lesson.type,
      title: lesson.title,
      content: lesson.content,
      writtenPronunciation: lesson.writtenPronunciation,
      example: lesson.example,
      englishEquivalent: lesson.englishEquivalent,
      status: lesson.status,
      order: lesson.order  
    };
    
    formData.append('lesson', JSON.stringify(lessonData));
    
    if (audioFile) {
      formData.append('pronunciation', audioFile);
    }
    
    return this.http.put(`${this.baseUrl}/update`, formData).pipe(
      tap(() => {
        this.getAllLessons().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  deactivateLesson(lessonId: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    return this.http.put(`${this.baseUrl}/deactivate`, { lessonId }).pipe(
      tap(() => {
        this.getAllLessons().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  toggleLessonStatus(lessonId: number, status: 'published' | 'draft'): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const formData = new FormData();
    const lessonData = {
      lessonId: lessonId,
      status: status
    };
    
    formData.append('lesson', JSON.stringify(lessonData));
    
    return this.http.put(`${this.baseUrl}/update`, formData).pipe(
      tap(() => {
        this.getAllLessons().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
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
          errorMessage = 'A lesson with this title already exists.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }
    
    console.error('Lesson Service Error:', error);
    this.errorSubject.next(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  refreshLessons(): void {
    this.getAllLessons().subscribe();
  }
}