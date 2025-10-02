import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  loading = false;
  error = '';
  hidePassword = true;
  hideRegisterPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tenantSlug: ['', [Validators.required]]
    });

    // Redirigir si ya está autenticado
    if (this.authService.isAuthenticated()) {
      this.redirectUser();
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      const { email, password } = this.loginForm.value;

      const credentials = this.sanitizeCredentials(email, password);

      this.authService.login(credentials.email, credentials.password).subscribe({
        next: () => {
          this.loading = false;
          this.redirectUser();
        },
        error: (error) => {
          this.loading = false;
          this.logSecureError('Login failed', error);
          this.error = this.getSecureErrorMessage(error, 'Error de autenticación. Verifica tus credenciales.');
        }
      });
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';

      const { name, email, password, tenantSlug } = this.registerForm.value;

      const userData = this.sanitizeUserData(name, email, password, tenantSlug);

      this.authService.register(userData.email, userData.password, userData.name, userData.tenantSlug).subscribe({
        next: () => {
          this.loading = false;
          this.redirectUser();
        },
        error: (error) => {
          this.loading = false;
          this.logSecureError('Registration failed', error);
          this.error = this.getSecureErrorMessage(error, 'Error al crear la cuenta. Intenta nuevamente.');
        }
      });
    }
  }

  private capitalizeWords(text: string): string {
    return text.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
  }

  private sanitizeInput(input: string): string {
    return input.trim().replace(/[<>"'&]/g, '');
  }

  private sanitizeCredentials(email: string, password: string) {
    return {
      email: this.sanitizeInput(email?.toLowerCase() || ''),
      password: this.sanitizeInput(password || '')
    };
  }

  private sanitizeUserData(name: string, email: string, password: string, tenantSlug: string) {
    const sanitizedName = this.capitalizeWords(this.sanitizeInput(name || ''));
    const sanitizedEmail = this.sanitizeInput(email?.toLowerCase() || '');
    const sanitizedPassword = this.sanitizeInput(password || '');
    const sanitizedTenant = this.sanitizeInput(tenantSlug?.toLowerCase() || '');

    return {
      name: sanitizedName,
      email: sanitizedEmail,
      password: sanitizedPassword,
      tenantSlug: sanitizedTenant
    };
  }

  private logSecureError(operation: string, error: any): void {
    const sanitizedError = {
      status: typeof error?.status === 'number' ? error.status : 0,
      timestamp: new Date().toISOString(),
      operation: this.sanitizeInput(operation)
    };
    console.error('Operation failed:', JSON.stringify(sanitizedError));
  }

  private getSecureErrorMessage(error: any, defaultMessage: string): string {
    if (error?.error?.message && typeof error.error.message === 'string') {
      return this.sanitizeInput(error.error.message);
    }
    return defaultMessage;
  }

  private redirectUser(): void {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'SUPERADMIN') {
      this.router.navigate(['/superadmin']);
    } else if (this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/voting']);
    }
  }
}