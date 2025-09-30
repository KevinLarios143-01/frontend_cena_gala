import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tenant-disabled',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="disabled-container">
      <mat-card class="disabled-card">
        <mat-card-header>
          <mat-icon mat-card-avatar color="warn">block</mat-icon>
          <mat-card-title>Encuesta No Disponible</mat-card-title>
          <mat-card-subtitle>Esta encuesta ha sido desactivada temporalmente</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>La encuesta a la que intentas acceder no está disponible en este momento.</p>
          <p>Por favor, contacta al administrador para más información.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="logout()">
            Cerrar Sesión
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .disabled-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    
    .disabled-card {
      max-width: 400px;
      text-align: center;
    }
    
    mat-card-content p {
      margin-bottom: 16px;
    }
  `]
})
export class TenantDisabledComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}