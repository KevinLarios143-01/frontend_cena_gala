import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiReopenService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Reopen service error');
    return throwError(() => error);
  }

  reopenNominations(categoryId: string): Observable<any> {
    if (!categoryId) {
      return throwError(() => new Error('Category ID is required'));
    }
    return this.http.patch(`${this.apiUrl}/categories/${categoryId}/reopen-nominations`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  reopenVoting(categoryId: string): Observable<any> {
    if (!categoryId) {
      return throwError(() => new Error('Category ID is required'));
    }
    return this.http.patch(`${this.apiUrl}/categories/${categoryId}/reopen-voting`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
}