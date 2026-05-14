
import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Alphabet, DictionaryWord} from '../Components/dictionary/dictionary';

export interface Lesson {
  lessonId?: number;
  type:  'NUMBER' | 'LANGUAGE_SYSTEM';
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

    return this.http.get<Lesson[]>(`${this.baseUrl}/all`).pipe(
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

  addWord(word: DictionaryWord): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Create the clean JSON payload
    const payload = {
      word: word.word,
      translation: word.translation,
      example: word.example,
      exampleTranslation: word.exampleTranslation
    };

    return this.http.post(`${this.wordUrl}/add`, payload).pipe(
      tap(() => {
        this.getAllWords().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  addAlphabet(alphabet: Alphabet): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Create the clean JSON payload
    const payload = {
      character: alphabet.character,
      nativePronunciation: alphabet.nativePronunciation,
      englishEquivalent: alphabet.englishEquivalent,
      nativeExample: alphabet.nativeExample,
      englishExample: alphabet.englishExample
    };

    return this.http.post(`${this.alphabetUrl}/add`, payload).pipe(
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
    if (lesson.title) formData.append('title', lesson.title);
    if (lesson.content) formData.append('content', lesson.content);
    if (lesson.writtenPronunciation) formData.append('writtenPronunciation', lesson.writtenPronunciation);
    if (lesson.example) formData.append('example', lesson.example);
    if (lesson.englishEquivalent) formData.append('englishEquivalent', lesson.englishEquivalent);
    if (lesson.status) formData.append('status', lesson.status);

    // Convert numbers to strings for FormData
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

  updateWord(wordId: number, word: Partial<DictionaryWord>): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Create a JSON object instead of FormData
    const payload = {
      wordId: wordId,
      word: word.word,
      translation: word.translation,
      example: word.example,
      exampleTranslation: word.exampleTranslation
    };

    // Angular automatically sets Content-Type to application/json
    return this.http.put(`${this.wordUrl}/update`, payload).pipe(
      tap(() => {
        // Refresh the list to reflect changes in the UI
        this.getAllWords().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  updateAlphabet(id: number, alphabet: Partial<Alphabet>): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Create a JSON object instead of FormData
    const payload = {
      id: alphabet.id,
      character: alphabet.character,
      nativePronunciation: alphabet.nativePronunciation,
      englishEquivalent: alphabet.englishEquivalent,
      nativeExample: alphabet.nativeExample,
      englishExample: alphabet.englishEquivalent
    };

    // Angular automatically sets Content-Type to application/json
    return this.http.put(`${this.alphabetUrl}/update`, payload).pipe(
      tap(() => {
        // Refresh the list to reflect changes in the UI
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
    if (lesson.title) formData.append('title', lesson.title);
    if (lesson.content) formData.append('content', lesson.content);
    if (lesson.writtenPronunciation) formData.append('writtenPronunciation', lesson.writtenPronunciation);
    if (lesson.example) formData.append('example', lesson.example);
    if (lesson.englishEquivalent) formData.append('englishEquivalent', lesson.englishEquivalent);
    if (lesson.status) formData.append('status', lesson.status);

    if (lesson.lessonOrder !== undefined) {
      formData.append('lessonOrder', lesson.lessonOrder.toString());
    }

    // const lessonData = {
    //   lessonId: lessonId,
    //   type: lesson.type,
    //   title: lesson.title,
    //   content: lesson.content,
    //   writtenPronunciation: lesson.writtenPronunciation,
    //   example: lesson.example,
    //   englishEquivalent: lesson.englishEquivalent,
    //   status: lesson.status,
    //   order: lesson.lessonOrder
    // };

    // formData.append('lesson', JSON.stringify(lessonData));

    if (audioFile) {
      formData.append('pronunciation', audioFile);
    }

    // Instead of console.log(formData);
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });



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

    // Create the query parameters (?wordId=...)
    const params = new HttpParams().set('wordId', wordId.toString());

    // Send DELETE request with params as the second argument
    return this.http.delete(`${this.wordUrl}/delete`, { params }).pipe(
      tap(() => {
        // Refresh the words list after deletion
        this.getAllWords().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  deleteAlphabet(id: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Create the query parameters (?wordId=...)
    const params = new HttpParams().set('id', id.toString());

    // Send DELETE request with params as the second argument
    return this.http.delete(`${this.alphabetUrl}/delete`, { params }).pipe(
      tap(() => {
        // Refresh the words list after deletion
        this.getAllAlphabets().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  toggleLessonStatus(lessonId: number, status: 'PUBLISHED' | 'DRAFT'): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const formData = new FormData();
    const lessonData = {
      lessonId: lessonId,
      status: status
    };

    formData.append('lesson', JSON.stringify(lessonData));

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
