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
    // Sanitized logging without exposing sensitive data
    console.error(`Error in ${context || 'application'}`);

    let message = 'Ha ocurrido un error inesperado';

    try {
      if (error?.error?.error && typeof error.error.error === 'string') {
        message = this.sanitizeMessage(error.error.error);
      } else if (error?.message && typeof error.message === 'string') {
        message = this.sanitizeMessage(error.message);
      }
    } catch (e) {
      message = 'Ha ocurrido un error inesperado';
    }

    this.showError(message);
  }

  private sanitizeMessage(message: string): string {
    // Remove potential XSS and limit length
    return message.replace(/[<>"'&]/g, '').substring(0, 200);
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
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.showError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/login']).catch(() => {
        console.error('Navigation failed');
      });
    } catch (error) {
      console.error('Auth error handling failed');
      window.location.href = '/login';
    }
  }
}