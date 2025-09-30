import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  handleError(error: any, context?: string): void {
    console.error(`Error in ${context || 'application'}:`, error);

    let message = 'Ha ocurrido un error inesperado';

    if (error?.error?.error) {
      message = error.error.error;
    } else if (error?.message) {
      message = error.message;
    }

    this.showError(message);
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showWarning(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: ['warning-snackbar']
    });
  }

  handleAuthError(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.showError('Sesión expirada. Por favor, inicia sesión nuevamente.');
    this.router.navigate(['/login']);
  }
}