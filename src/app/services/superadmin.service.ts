import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getTenants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/superadmin/tenants`, { headers: this.getHeaders() });
  }

  createTenant(tenantData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/superadmin/tenants`, tenantData, { headers: this.getHeaders() });
  }

  updateTenantStatus(tenantId: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/superadmin/tenants/${tenantId}/status`, 
      { isActive }, 
      { headers: this.getHeaders() }
    );
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/superadmin/stats`, { headers: this.getHeaders() });
  }

  getTenantCategories(tenantId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/superadmin/tenants/${tenantId}/categories`, { headers: this.getHeaders() });
  }
}