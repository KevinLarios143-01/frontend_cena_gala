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
      
      // Sanitizar inputs
      const sanitizedEmail = this.sanitizeInput(email?.toLowerCase() || '');
      const sanitizedPassword = this.sanitizeInput(password || '');
      
      this.authService.login(sanitizedEmail, sanitizedPassword).subscribe({
        next: () => {
          this.loading = false;
          this.redirectUser();
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Error de autenticación. Verifica tus credenciales.';
        }
      });
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';
      
      const { name, email, password, tenantSlug } = this.registerForm.value;
      
      // Sanitizar inputs
      const sanitizedEmail = this.sanitizeInput(email?.toLowerCase() || '');
      const sanitizedPassword = this.sanitizeInput(password || '');
      const sanitizedName = this.sanitizeInput(name || '');
      const sanitizedTenant = this.sanitizeInput(tenantSlug?.toLowerCase() || '');
      
      this.authService.register(sanitizedEmail, sanitizedPassword, this.capitalizeWords(sanitizedName), sanitizedTenant).subscribe({
        next: () => {
          this.loading = false;
          this.redirectUser();
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Error al crear la cuenta. Intenta nuevamente.';
        }
      });
    }
  }

  private capitalizeWords(text: string): string {
    return text.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
  }

  private sanitizeInput(input: string): string {
    return input.replace(/[<>"'&]/g, '');
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