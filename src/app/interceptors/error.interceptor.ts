import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

const logCriticalError = (error: HttpErrorResponse): void => {
  // In production, send to logging service
  console.error('Critical server error:', {
    status: error.status,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Error desconocido';

      if (error.error instanceof ErrorEvent) {
        // Error del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del servidor
        switch (error.status) {
          case 400:
            errorMessage = error.error?.error || 'Solicitud inválida';
            break;
          case 401:
            errorMessage = error.error?.error || 'No autorizado';
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.navigate(['/login']).catch(navError => {
              console.error('Navigation Error:', navError);
            });
            break;
          case 403:
            errorMessage = error.error?.error || 'Acceso denegado';
            break;
          case 404:
            errorMessage = error.error?.error || 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = error.error?.error || 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.error?.error || error.message}`;
        }
      }

      // Mostrar error en snackbar
      snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });

      // Log error details for debugging (sanitized)
      console.error('HTTP Error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url?.split('?')[0], // Remove query params
        timestamp: new Date().toISOString()
      });

      // Log to external service in production
      if (error.status >= 500) {
        logCriticalError(error);
      }

      return throwError(() => error);
    })
  );
};