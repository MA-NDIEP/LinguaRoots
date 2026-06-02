import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import {catchError, tap, finalize, map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Alphabet, DictionaryWord} from '../Components/dictionary/dictionary';
import {BackendPost, CulturalPost} from './post';

export interface Lesson {
  lessonId?: number;
  type: 'NUMBER' | 'LANGUAGE_SYSTEM' | 'NAME';
  name: string;  // ← THIS WAS MISSING
  title: string;
  content: string;
  writtenPronunciation: string;
  example: string;
  englishEquivalent: string;
  status: 'PUBLISHED' | 'DRAFT';
  audioUrl?: string;
  pronunciation?: File;
  lessonOrder: number;
}

export interface BackendLesson {
  lessonId?: number;
  type: 'NUMBER' | 'LANGUAGE_SYSTEM' | 'NAME';
  name: string;
  title: string;
  content: string;
  writtenPronunciation: string;
  example: string;
  englishEquivalent: string;
  status: 'PUBLISHED' | 'DRAFT';
  pronunciation?: string;
  lessonOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private ApiUrl = environment.ApiUrl;

  private baseUrl = `${this.ApiUrl}/lesson`;
  private wordUrl = `${this.ApiUrl}/word`;
  private alphabetUrl = `${this.ApiUrl}/alphabet`;

  private lessonsSubject = new BehaviorSubject<Lesson[]>([]);
  lessons$ = this.lessonsSubject.asObservable();

  private wordsSubject = new BehaviorSubject<DictionaryWord[]>([]);
  words$ = this.wordsSubject.asObservable();

  private alphabetSubject = new BehaviorSubject<Alphabet[]>([]);
  alphabet$ = this.alphabetSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllLessons(): Observable<Lesson[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<BackendLesson[]>(`${this.baseUrl}/all`).pipe(
      map(backendLessons => backendLessons.map(lesson => this.convertToUILesson(lesson))),
      tap(lessons => {
        this.lessonsSubject.next(lessons);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getAllWords(): Observable<DictionaryWord[]>{
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<DictionaryWord[]>(`${this.wordUrl}/all`).pipe(
      tap(Words => {
        this.wordsSubject.next(Words);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getAllAlphabets(): Observable<Alphabet[]>{
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Alphabet[]>(`${this.alphabetUrl}/all`).pipe(
      tap(Alphabets => {
        this.alphabetSubject.next(Alphabets);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  addWord(word: DictionaryWord, audioFile?: File): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const formData = new FormData();
    if (word.word) formData.append('word', word.word);
    if (word.translation) formData.append('translation', word.translation);
    if (word.example) formData.append('example', word.example);
    if (word.exampleTranslation) formData.append('exampleTranslation', word.exampleTranslation);
    if (audioFile) formData.append('audioUrl', audioFile);

    return this.http.post(`${this.wordUrl}/add`, formData).pipe(
      tap(() => {
        this.getAllWords().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  addAlphabet(alphabet: Alphabet, audioFile?: File): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const formData = new FormData();
    if (alphabet.character) formData.append('character', alphabet.character);
    if (alphabet.englishEquivalent) formData.append('englishEquivalent', alphabet.englishEquivalent);
    if (alphabet.nativeExample) formData.append('nativeExample', alphabet.nativeExample);
    if (alphabet.englishExample) formData.append('englishExample', alphabet.englishExample);
    if (audioFile) formData.append('nativePronunciation', audioFile);

    return this.http.post(`${this.alphabetUrl}/add`, formData).pipe(
      tap(() => {
        this.getAllAlphabets().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  addLesson(lesson: Lesson, audioFile?: File): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const formData = new FormData();

    if (lesson.type) formData.append('type', lesson.type);
    if (lesson.name) formData.append('name', lesson.name);
    if (lesson.title) formData.append('title', lesson.title);
    if (lesson.content) formData.append('content', lesson.content);
    if (lesson.writtenPronunciation) formData.append('writtenPronunciation', lesson.writtenPronunciation);
    if (lesson.example) formData.append('example', lesson.example);
    if (lesson.englishEquivalent) formData.append('englishEquivalent', lesson.englishEquivalent);
    if (lesson.status) formData.append('status', lesson.status);

    if (lesson.lessonOrder !== undefined) {
      formData.append('lessonOrder', lesson.lessonOrder.toString());
    }

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

  uploadAudio(formData: FormData): Observable<{audioUrl: string}> {
    return this.http.post<{audioUrl: string}>(`${this.wordUrl}/upload-audio`, formData);
  }

  saveAlphabetAudio(id: number, audioUrl: string): Observable<any> {
    return this.http.patch(`${this.alphabetUrl}/${id}`, { nativePronunciation: audioUrl });
  }

  updateWord(wordId: number, word: Partial<DictionaryWord>, audioFile?: File, audioDeleted?: boolean, deletedAudioUrl?: string | null): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const formData = new FormData();

    if (wordId !== undefined) {
      formData.append('wordId', wordId.toString());
    }

    if (word.word) formData.append('word', word.word);
    if (word.translation) formData.append('translation', word.translation);
    if (word.example) formData.append('example', word.example);
    if (word.exampleTranslation) formData.append('exampleTranslation', word.exampleTranslation);

    // Add audio deletion flags to formData
    if (audioDeleted) {
      formData.append('audioDeleted', 'true');
      if (deletedAudioUrl) {
        formData.append('deletedAudioUrl', deletedAudioUrl);
      }
    }

    // Add new audio file if provided
    if (audioFile) {
      formData.append('audioUrl', audioFile);
    }

    return this.http.put(`${this.wordUrl}/update`, formData).pipe(
      tap(() => {
        this.getAllWords().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  updateAlphabet(id: number, alphabet: Partial<Alphabet>, audioFile?: File, audioDeleted?: boolean, deletedAudioUrl?: string | null): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const formData = new FormData();

    if (id !== undefined) {
      formData.append('id', id.toString());
    }

    // Add alphabet text fields
    if (alphabet.character) formData.append('character', alphabet.character);
    if (alphabet.englishEquivalent) formData.append('englishEquivalent', alphabet.englishEquivalent);
    if (alphabet.nativeExample) formData.append('nativeExample', alphabet.nativeExample);
    if (alphabet.englishExample) formData.append('englishExample', alphabet.englishExample);

    // Add audio deletion flags to formData
    if (audioDeleted) {
      formData.append('audioDeleted', 'true');
      if (deletedAudioUrl) {
        formData.append('deletedAudioUrl', deletedAudioUrl);
      }
    }

    // Add new audio file if provided
    if (audioFile) {
      formData.append('nativePronunciation', audioFile);
    }

    return this.http.put(`${this.alphabetUrl}/update`, formData).pipe(
      tap(() => {
        this.getAllAlphabets().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  updateLesson(lessonId: number, lesson: Partial<Lesson>, audioFile?: File): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const formData = new FormData();

    if (lesson.lessonId !== undefined) {
      formData.append('lessonId', lesson.lessonId.toString());
    }

    if (lesson.type) formData.append('type', lesson.type);
    if (lesson.name) formData.append('name', lesson.name);
    if (lesson.title) formData.append('title', lesson.title);
    if (lesson.content) formData.append('content', lesson.content);
    if (lesson.writtenPronunciation) formData.append('writtenPronunciation', lesson.writtenPronunciation);
    if (lesson.example) formData.append('example', lesson.example);
    if (lesson.englishEquivalent) formData.append('englishEquivalent', lesson.englishEquivalent);
    if (lesson.status) formData.append('status', lesson.status);

    if (lesson.lessonOrder !== undefined) {
      formData.append('lessonOrder', lesson.lessonOrder.toString());
    }

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

  deleteWord(wordId: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete(`${this.wordUrl}/delete/${wordId}`).pipe(
      tap(() => {
        this.getAllWords().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  deleteAlphabet(id: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete(`${this.alphabetUrl}/delete/${id}`).pipe(
      tap(() => {
        this.getAllAlphabets().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  private convertToUILesson(backendLesson: BackendLesson): Lesson {
    return {
      lessonId: backendLesson.lessonId,
      type: backendLesson.type,
      name: backendLesson.name,
      title: backendLesson.title,
      content: backendLesson.content,
      writtenPronunciation: backendLesson.writtenPronunciation,
      example: backendLesson.example,
      englishEquivalent: backendLesson.englishEquivalent,
      status: backendLesson.status,
      audioUrl: backendLesson.pronunciation,
      lessonOrder: backendLesson.lessonOrder
    };
  }

  toggleLessonStatus(lessonId: number, status: 'PUBLISHED' | 'DRAFT'): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete(`${this.baseUrl}/delete/${lessonId}`).pipe(
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
