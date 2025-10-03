import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../services/auth.service';
import { ApiService, Category, Participant, Finalist } from '../../services/api.service';

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTableModule
  ],
  templateUrl: './voting.component.html',
  styleUrl: './voting.component.css'
})
export class VotingComponent implements OnInit {
  categories: Category[] = [];
  participants: { [categoryId: string]: Participant[] } = {};
  finalists: { [categoryId: string]: Finalist[] } = {};
  results: { [categoryId: string]: Finalist[] } = {};
  userVotes: { [categoryId: string]: boolean } = {};
  userNominations: { [categoryId: string]: any[] } = {}; // Store array of nominations
  votedFinalists: { [categoryId: string]: string } = {}; // Store voted finalist name

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        categories.forEach(category => {
          if (category.status === 'NOMINATION') {
            this.loadParticipants(category.id);
            this.checkUserNomination(category.id);
          } else if (category.status === 'VOTING_FINAL') {
            this.loadFinalists(category.id);
            this.checkUserVote(category.id);
          } else if (category.status === 'FINISHED') {
            this.loadResults(category.id);
          }
        });
      },
      error: (error) => {
        console.error('Error loading categories');
        this.snackBar.open('Error al cargar categorías', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadParticipants(categoryId: string): void {
    this.apiService.getParticipantsByCategory(categoryId).subscribe({
      next: (participants) => {
        this.participants[categoryId] = participants;
      },
      error: (error) => {
        console.error('Error loading participants');
        this.snackBar.open('Error al cargar participantes', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadFinalists(categoryId: string): void {
    this.apiService.getFinalists(categoryId).subscribe({
      next: (finalists) => {
        this.finalists[categoryId] = finalists;
      },
      error: (error) => {
        console.error('Error loading finalists');
        this.snackBar.open('Error al cargar finalistas', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadResults(categoryId: string): void {
    this.apiService.getVoteResults(categoryId).subscribe({
      next: (results) => {
        this.results[categoryId] = results;
      },
      error: (error) => {
        console.error('Error loading results');
        this.snackBar.open('Error al cargar resultados', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onNominate(categoryId: string, participantId: string): void {
    this.apiService.createNomination(categoryId, participantId).subscribe({
      next: (result) => {
        this.checkUserNomination(categoryId);

        this.snackBar.open('Nominación registrada exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Nomination error');
        this.snackBar.open('Error al registrar nominación', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onVote(categoryId: string, finalistId: string): void {
    this.apiService.createVote(categoryId, finalistId).subscribe({
      next: (result) => {
        this.userVotes[categoryId] = true;

        // Store the voted finalist name
        const votedFinalist = this.finalists[categoryId]?.find(f => f.id === finalistId);
        if (votedFinalist) {
          this.votedFinalists[categoryId] = votedFinalist.participant.name;
        }

        this.snackBar.open('Voto registrado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Vote error');
        this.snackBar.open('Error al registrar voto', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'NOMINATION': return 'primary';
      case 'SELECTION_FINALISTS': return 'accent';
      case 'VOTING_FINAL': return 'warn';
      case 'FINISHED': return '';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'NOMINATION': return 'Fase de Nominación';
      case 'SELECTION_FINALISTS': return 'Seleccionando Finalistas';
      case 'VOTING_FINAL': return 'Votación Final';
      case 'FINISHED': return 'Finalizada';
      default: return status;
    }
  }

  getActionText(status: string): string {
    switch (status) {
      case 'NOMINATION': return 'Nominar';
      case 'VOTING_FINAL': return 'Votar';
      default: return '';
    }
  }

  canInteract(status: string): boolean {
    return status === 'NOMINATION' || status === 'VOTING_FINAL';
  }

  checkUserVote(categoryId: string): void {
    this.apiService.checkUserVote(categoryId).subscribe({
      next: (result) => {
        this.userVotes[categoryId] = result.hasVoted;

        if (result.hasVoted && result.vote) {
          this.votedFinalists[categoryId] = result.vote.finalist.participant.name;
        }
      },
      error: (error) => {
        console.error('Error checking user vote');
        this.userVotes[categoryId] = false;
      }
    });
  }

  checkUserNomination(categoryId: string): void {
    this.apiService.checkUserNomination(categoryId).subscribe({
      next: (result) => {
        this.userNominations[categoryId] = result.nominations || [];
      },
      error: (error) => {
        console.error('Error checking user nomination');
        this.userNominations[categoryId] = [];
      }
    });
  }

  hasUserVoted(categoryId: string): boolean {
    return this.userVotes[categoryId] || false;
  }

  hasUserNominated(categoryId: string): boolean {
    return (this.userNominations[categoryId] || []).length > 0;
  }

  getUserNominations(categoryId: string): any[] {
    return this.userNominations[categoryId] || [];
  }

  canNominate(categoryId: string): boolean {
    return (this.userNominations[categoryId] || []).length < 3;
  }

  isParticipantNominated(categoryId: string, participantId: string): boolean {
    return (this.userNominations[categoryId] || []).some(n => n.participantId === participantId);
  }

  getVotedFinalistName(categoryId: string): string {
    return this.votedFinalists[categoryId] || '';
  }

  getVotedFinalist(categoryId: string): any {
    // Return a mock object for the table
    const name = this.votedFinalists[categoryId];
    return name ? { finalist: { participant: { name: name } } } : null;
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';

    // Si ya es una URL completa (http/https), devolverla tal como está
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // Si es solo un nombre de archivo, construir la URL de Firebase usando la ruta de usuarios
    return `https://firebasestorage.googleapis.com/v0/b/fl-farms-gl.firebasestorage.app/o/images%2Fusers%2F${encodeURIComponent(imageUrl)}?alt=media`;
  }

  onImageError(event: any, participantName: string): void {
    console.error('Image failed to load for:', participantName, 'URL:', event.target.src);
  }

  viewParticipants(): void {
    this.router.navigate(['/participants']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']).catch(() => {
      window.location.href = '/login';
    });
  }
}