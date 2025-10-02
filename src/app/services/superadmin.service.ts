import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('SuperAdmin service error');
    return throwError(() => error);
  }

  getTenants(): Observable<any> {
    try {
      return this.http.get(`${this.apiUrl}/superadmin/tenants`, { headers: this.getHeaders() })
        .pipe(catchError(this.handleError));
    } catch (error) {
      return this.handleError(error);
    }
  }

  createTenant(tenantData: any): Observable<any> {
    try {
      if (!tenantData || !tenantData.name) {
        return throwError(() => new Error('Invalid tenant data'));
      }
      return this.http.post(`${this.apiUrl}/superadmin/tenants`, tenantData, { headers: this.getHeaders() })
        .pipe(catchError(this.handleError));
    } catch (error) {
      return this.handleError(error);
    }
  }

  updateTenantStatus(tenantId: string, isActive: boolean): Observable<any> {
    try {
      if (!tenantId) {
        return throwError(() => new Error('Tenant ID is required'));
      }
      return this.http.patch(`${this.apiUrl}/superadmin/tenants/${tenantId}/status`, 
        { isActive }, 
        { headers: this.getHeaders() }
      ).pipe(catchError(this.handleError));
    } catch (error) {
      return this.handleError(error);
    }
  }

  getStats(): Observable<any> {
    try {
      return this.http.get(`${this.apiUrl}/superadmin/stats`, { headers: this.getHeaders() })
        .pipe(catchError(this.handleError));
    } catch (error) {
      return this.handleError(error);
    }
  }

  getTenantCategories(tenantId: string): Observable<any> {
    try {
      if (!tenantId) {
        return throwError(() => new Error('Tenant ID is required'));
      }
      return this.http.get(`${this.apiUrl}/superadmin/tenants/${tenantId}/categories`, { headers: this.getHeaders() })
        .pipe(catchError(this.handleError));
    } catch (error) {
      return this.handleError(error);
    }
  }
}