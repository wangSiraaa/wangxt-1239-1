import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Result, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUser: User | null = null;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<User> {
    return this.http.post<Result<any>>(`${environment.apiBaseUrl}/auth/login`, { username, password })
      .pipe(
        map(res => {
          if (res.code === 200 && res.data) {
            this.currentUser = res.data;
            localStorage.setItem('currentUser', JSON.stringify(res.data));
            localStorage.setItem('token', res.data.token);
            return res.data;
          }
          throw new Error(res.message || '登录失败');
        })
      );
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(roleCode: string): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.roleCode === roleCode;
  }
}
