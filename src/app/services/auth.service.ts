import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'PARTICIPANT';
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        const parsedUser = JSON.parse(user);
        if (this.isValidUser(parsedUser)) {
          this.currentUserSubject.next(parsedUser);
        } else {
          this.logout();
        }
      }
    } catch (error) {
      this.logout();
    }
  }

  private isValidUser(user: any): boolean {
    return user && 
           typeof user.id === 'string' && 
           typeof user.email === 'string' && 
           typeof user.name === 'string' && 
           ['SUPERADMIN', 'ADMIN', 'PARTICIPANT'].includes(user.role);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response?.token && response?.user && this.isValidUser(response.user)) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          } else {
            throw new Error('Invalid response format');
          }
        })
      );
  }

  register(email: string, password: string, name: string, tenantSlug: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { email, password, name, tenantSlug })
      .pipe(
        tap(response => {
          if (response?.token && response?.user && this.isValidUser(response.user)) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          } else {
            throw new Error('Invalid response format');
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'ADMIN';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}