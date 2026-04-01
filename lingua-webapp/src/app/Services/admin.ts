import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';

export interface Admin {
  id?: number;
  name: string;
  email: string;
  telephone: number;
  isActive: boolean;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:8080/admin'; 
  private adminsSubject = new BehaviorSubject<Admin[]>([]);
  admins$ = this.adminsSubject.asObservable();
  
 
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

 
  getAllAdmins(): Observable<Admin[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    return this.http.get<Admin[]>(`${this.baseUrl}/all`).pipe(
      tap(admins => {
        this.adminsSubject.next(admins);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  
  addAdmin(admin: Admin): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    return this.http.post(`${this.baseUrl}/add`, admin).pipe(
      tap(() => {
        this.getAllAdmins().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

 
  updateAdmin(id: number, admin: Partial<Admin>): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    return this.http.put(`${this.baseUrl}/update`, { id, ...admin }).pipe(
      tap(() => {
      
        this.getAllAdmins().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  
  deactivateAdmin(id: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    return this.http.put(`${this.baseUrl}/deactivate`, { id }).pipe(
      tap(() => {
       
        this.getAllAdmins().subscribe();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  
  activateAdmin(id: number): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    return this.http.put(`${this.baseUrl}/update`, { id, isActive: true }).pipe(
      tap(() => {
       
        this.getAllAdmins().subscribe();
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
          errorMessage = 'An admin with this email already exists.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }
    
    console.error('Admin Service Error:', error);
    this.errorSubject.next(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

 
  clearError(): void {
    this.errorSubject.next(null);
  }

 
  refreshAdmins(): void {
    this.getAllAdmins().subscribe();
  }
}