import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { storage } from '../config/firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'NOMINATION' | 'SELECTION_FINALISTS' | 'VOTING_FINAL' | 'FINISHED';
  nominationStartDate?: string;
  nominationEndDate?: string;
  votingStartDate?: string;
  votingEndDate?: string;
  participants?: Participant[];
  _count?: {
    nominations: number;
    votes: number;
  };
}

export interface User {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Participant {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId: string;
  user?: User;
  _count?: {
    nominations: number;
  };
}

export interface Nomination {
  id: string;
  userId: string;
  categoryId: string;
  participantId: string;
  participant: Participant;
  createdAt: string;
}

export interface Finalist {
  id: string;
  categoryId: string;
  participantId: string;
  nominationCount: number;
  participant: Participant;
  _count?: {
    votes: number;
  };
}

export interface Vote {
  id: string;
  userId: string;
  categoryId: string;
  finalistId: string;
  finalist: Finalist;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
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
    console.error('API service error');
    return throwError(() => error);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<{success: boolean, data: Category[]}>(`${this.apiUrl}/categories`, { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category, { headers: this.getHeaders() });
  }

  updateCategoryStatus(categoryId: string, status: string): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${categoryId}/status`, { status }, { headers: this.getHeaders() });
  }

  deleteCategory(categoryId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${categoryId}`, { headers: this.getHeaders() });
  }

  // Participants
  getParticipantsByCategory(categoryId: string): Observable<Participant[]> {
    return this.http.get<Participant[]>(`${this.apiUrl}/participants/category/${categoryId}`, { headers: this.getHeaders() });
  }

  createParticipant(participant: Partial<Participant>): Observable<Participant> {
    return this.http.post<Participant>(`${this.apiUrl}/participants`, participant, { headers: this.getHeaders() });
  }

  // Nominations
  createNomination(categoryId: string, participantId: string): Observable<Nomination> {
    if (!categoryId || !participantId) {
      return throwError(() => new Error('Category ID and Participant ID are required'));
    }
    return this.http.post<{success: boolean, data: Nomination}>(`${this.apiUrl}/nominations`, { categoryId, participantId }, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  checkUserNomination(categoryId: string): Observable<{nominationCount: number, nominations: any[], canNominate: boolean}> {
    return this.http.get<{success: boolean, data: {nominationCount: number, nominations: any[], canNominate: boolean}}>(`${this.apiUrl}/nominations/user-nomination/${categoryId}`, { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  checkUserVote(categoryId: string): Observable<{hasVoted: boolean, vote: any}> {
    return this.http.get<{success: boolean, data: {hasVoted: boolean, vote: any}}>(`${this.apiUrl}/votes/user-vote/${categoryId}`, { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  resetSystem(): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/reset-system`, {}, { headers: this.getHeaders() });
  }

  getNominationsByCategory(categoryId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/nominations/category/${categoryId}`, { headers: this.getHeaders() });
  }

  generateFinalists(categoryId: string): Observable<Finalist[]> {
    return this.http.post<{success: boolean, data: Finalist[]}>(`${this.apiUrl}/nominations/generate-finalists/${categoryId}`, {}, { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  // Votes
  createVote(categoryId: string, finalistId: string): Observable<Vote> {
    if (!categoryId || !finalistId) {
      return throwError(() => new Error('Category ID and Finalist ID are required'));
    }
    return this.http.post<Vote>(`${this.apiUrl}/votes`, { categoryId, finalistId }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getVoteResults(categoryId: string): Observable<Finalist[]> {
    return this.http.get<Finalist[]>(`${this.apiUrl}/votes/results/${categoryId}`, { headers: this.getHeaders() });
  }

  getStats(): Observable<any> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/votes/stats`, { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  // Finalists
  getFinalists(categoryId: string): Observable<Finalist[]> {
    return this.http.get<{success: boolean, data: Finalist[]}>(`${this.apiUrl}/categories/${categoryId}/finalists`, { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  // Reopen methods
  reopenNominations(categoryId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/categories/${categoryId}/reopen-nominations`, {}, { headers: this.getHeaders() });
  }

  reopenVoting(categoryId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/categories/${categoryId}/reopen-voting`, {}, { headers: this.getHeaders() });
  }

  deleteAllUsers(): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/delete-all-users`, {}, { headers: this.getHeaders() });
  }

  getUsers(): Observable<any[]> {
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/admin/users`, { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  updateUserPhoto(userId: string, imageUrl: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}/photo`, { imageUrl }, { headers: this.getHeaders() });
  }

  getUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users/${userId}`, { headers: this.getHeaders() });
  }
  
  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}`, userData, { headers: this.getHeaders() });
  }

  uploadUserPhoto(userId: string, file: File): Observable<string> {
    const fileName = `users/${userId}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);
    
    return from(uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef)));
  }


}