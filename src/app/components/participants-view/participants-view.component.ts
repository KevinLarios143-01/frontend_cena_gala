import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-participants-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatToolbarModule,
    MatSnackBarModule
  ],
  templateUrl: './participants-view.component.html',
  styleUrl: './participants-view.component.css'
})
export class ParticipantsViewComponent implements OnInit {
  participants: any[] = [];
  loading = false;

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadParticipants();
  }

  loadParticipants(): void {
    this.loading = true;
    this.apiService.getParticipantUsers().subscribe({
      next: (participants) => {
        this.participants = participants;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.logSecureError('Load participants failed', error);
        this.snackBar.open('Error al cargar participantes', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }



  private logSecureError(operation: string, error: any): void {
    const sanitizedError = {
      status: typeof error?.status === 'number' ? error.status : 0,
      timestamp: new Date().toISOString(),
      operation: this.sanitizeInput(operation)
    };
    console.error('Operation failed:', JSON.stringify(sanitizedError));
  }

  private sanitizeInput(input: string): string {
    return input.trim().replace(/[<>"'&]/g, '');
  }

  onImageError(event: any): void {
    (event.target as HTMLImageElement).src = 'assets/default-avatar.png';
  }

  goBack(): void {
    this.router.navigate(['/voting']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}