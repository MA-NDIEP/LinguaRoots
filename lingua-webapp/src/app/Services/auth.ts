import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private ApiUrl = environment.ApiUrl;

  private apiUrl = `${this.ApiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  login(data: any) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(response => {
          // 2. Access properties from the object
          const token = response.token;
          const username = response.username;

          localStorage.setItem('token', token);
          localStorage.setItem('username', username);
          localStorage.setItem('userId', response.userId.toString())

          const payload = this.decodeToken(token);
          const role = payload.role;

          localStorage.setItem('role', role);

          this.redirectUser(role);
        })
      );
  }

  decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  redirectUser(role: string) {
    if (role === 'ROLE_ADMIN') {
      this.router.navigate(['/dashboard']);
    } else if (role === 'ROLE_SUPER_ADMIN') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/student']);
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
