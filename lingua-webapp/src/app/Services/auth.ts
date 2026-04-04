import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private apiUrl = 'http://localhost:8765/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(data: any) {
    return this.http.post(`${this.apiUrl}/login`, data, { responseType: 'text' })
      .pipe(
        tap(token => {
          // ✅ Save token
          localStorage.setItem('token', token);

          const payload = this.decodeToken(token);
          const role = payload.role;

          localStorage.setItem('role', role);

          // ✅ Redirect
          this.redirectUser(role);
        })
      );
  }

  decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  redirectUser(role: string) {
    if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (role === 'SUPERADMIN') {
      this.router.navigate(['/superadmin']);
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
