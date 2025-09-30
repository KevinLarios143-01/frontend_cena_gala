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
  ) {}

  ngOnInit(): void {
    console.log('VotingComponent initialized');
    this.loadCategories();
  }

  loadCategories(): void {
    console.log('Loading categories...');
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded:', categories);
        this.categories = categories;
        categories.forEach(category => {
          console.log(`Category ${category.name} status: ${category.status}`);
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
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadParticipants(categoryId: string): void {
    this.apiService.getParticipantsByCategory(categoryId).subscribe({
      next: (participants) => {
        this.participants[categoryId] = participants;
      },
      error: (error) => console.error('Error loading participants:', error)
    });
  }

  loadFinalists(categoryId: string): void {
    console.log('Loading finalists for category:', categoryId);
    this.apiService.getFinalists(categoryId).subscribe({
      next: (finalists) => {
        console.log('Finalists loaded:', finalists);
        this.finalists[categoryId] = finalists;
      },
      error: (error) => console.error('Error loading finalists:', error)
    });
  }

  loadResults(categoryId: string): void {
    this.apiService.getVoteResults(categoryId).subscribe({
      next: (results) => {
        this.results[categoryId] = results;
      },
      error: (error) => console.error('Error loading results:', error)
    });
  }

  onNominate(categoryId: string, participantId: string): void {
    console.log('=== NOMINATE BUTTON CLICKED ===');
    console.log('Category ID:', categoryId);
    console.log('Participant ID:', participantId);
    
    this.snackBar.open('Botón nominar clickeado! Ver consola para detalles.', 'Cerrar', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
    
    this.apiService.createNomination(categoryId, participantId).subscribe({
      next: (result) => {
        console.log('Nomination successful:', result);
        // Nominations will be reloaded by checkUserNomination call below
        
        // Reload nominations after successful nomination
        this.checkUserNomination(categoryId);
        
        this.snackBar.open('Nominación registrada exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Nomination error:', error);
        // El error se maneja globalmente por el interceptor
      }
    });
  }

  onVote(categoryId: string, finalistId: string): void {
    console.log('Vote clicked:', { categoryId, finalistId });
    
    this.snackBar.open('Botón votar clickeado! Ver consola para detalles.', 'Cerrar', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
    
    this.apiService.createVote(categoryId, finalistId).subscribe({
      next: (result) => {
        console.log('Vote successful:', result);
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
        console.error('Vote error:', error);
        // El error se maneja globalmente por el interceptor
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
        console.log('User vote check:', result);
        this.userVotes[categoryId] = result.hasVoted;
        
        if (result.hasVoted && result.vote) {
          this.votedFinalists[categoryId] = result.vote.finalist.participant.name;
        }
      },
      error: (error) => {
        console.error('Error checking user vote:', error);
        this.userVotes[categoryId] = false;
      }
    });
  }

  checkUserNomination(categoryId: string): void {
    this.apiService.checkUserNomination(categoryId).subscribe({
      next: (result) => {
        console.log('User nomination check:', result);
        this.userNominations[categoryId] = result.nominations || [];
      },
      error: (error) => {
        console.error('Error checking user nomination:', error);
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}