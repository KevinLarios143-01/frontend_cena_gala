import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { SuperAdminService } from '../../services/superadmin.service';

@Component({
  selector: 'app-superadmin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './superadmin.component.html',
  styleUrl: './superadmin.component.css'
})
export class SuperAdminComponent implements OnInit {
  tenants: any[] = [];
  stats: any = {};
  tenantForm: FormGroup;
  superAdminForm: FormGroup;
  displayedColumns: string[] = ['name', 'slug', 'users', 'categories', 'nominations', 'votes', 'status', 'actions'];

  constructor(
    public authService: AuthService,
    private superAdminService: SuperAdminService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.tenantForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      adminName: ['', Validators.required],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.superAdminForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadTenants();
    this.loadStats();
  }

  loadTenants(): void {
    this.superAdminService.getTenants().subscribe({
      next: (response) => {
        this.tenants = response.data;
      },
      error: (error) => console.error('Error loading tenants:', error)
    });
  }

  loadStats(): void {
    this.superAdminService.getStats().subscribe({
      next: (response) => {
        this.stats = response.data;
      },
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  onCreateTenant(): void {
    if (this.tenantForm.valid) {
      this.superAdminService.createTenant(this.tenantForm.value).subscribe({
        next: (response) => {
          this.snackBar.open('Tenant creado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.tenantForm.reset();
          this.loadTenants();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error creating tenant:', error);
          this.snackBar.open('Error al crear tenant', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onToggleTenantStatus(tenant: any): void {
    this.superAdminService.updateTenantStatus(tenant.id, !tenant.isActive).subscribe({
      next: (response) => {
        this.snackBar.open(`Tenant ${tenant.isActive ? 'desactivado' : 'activado'} exitosamente`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadTenants();
      },
      error: (error) => {
        console.error('Error updating tenant status:', error);
        this.snackBar.open('Error al actualizar estado del tenant', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}