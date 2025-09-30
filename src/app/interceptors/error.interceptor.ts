import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

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
            router.navigate(['/login']);
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

      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: error.url,
        error: error.error
      });

      return throwError(() => error);
    })
  );
};