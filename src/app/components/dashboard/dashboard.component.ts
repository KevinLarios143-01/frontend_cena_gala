import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { ApiService, Category, Participant } from '../../services/api.service';
import { UserManagementComponent } from '../user-management/user-management.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    UserManagementComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  categories: Category[] = [];
  participants: Participant[] = [];
  users: any[] = [];
  selectedCategory: Category | null = null;
  stats: any = {};
  categoryResults: { [categoryId: string]: any[] } = {};
  activeTab: string = 'categories';

  categoryForm: FormGroup;

  displayedColumns = ['name', 'description', 'nominations', 'actions'];

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadStats();
    this.loadUsers();
    this.loadAllResults();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadAllResults();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Error al cargar categorías', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadStats(): void {
    this.apiService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error: any) => {
        console.error('Error loading stats:', error);
        this.snackBar.open('Error al cargar estadísticas', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadParticipants(categoryId: string): void {
    this.apiService.getParticipantsByCategory(categoryId).subscribe({
      next: (participants) => {
        this.participants = participants;
      },
      error: (error) => {
        console.error('Error loading participants:', error);
        this.snackBar.open('Error al cargar participantes', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCreateCategory(): void {
    if (this.categoryForm.valid) {
      this.apiService.createCategory(this.categoryForm.value).subscribe({
        next: () => {
          this.categoryForm.reset();
          this.loadCategories();
          this.snackBar.open('Categoría creada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.snackBar.open('Error al crear categoría', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  loadUsers(): void {
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadAllResults(): void {
    this.categories.forEach(category => {
      if (category.status === 'FINISHED') {
        this.loadCategoryResults(category.id);
      }
    });
  }

  loadCategoryResults(categoryId: string): void {
    this.apiService.getVoteResults(categoryId).subscribe({
      next: (results) => {
        this.categoryResults[categoryId] = results;
      },
      error: (error) => {
        console.error('Error loading category results:', error);
        this.snackBar.open('Error al cargar resultados', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onSelectCategory(category: Category): void {
    this.selectedCategory = category;
    this.loadParticipants(category.id);

    // Cambiar a la pestaña de participantes (índice 2 porque Resultados es índice 1)
    this.tabGroup.selectedIndex = 2;

    // Mostrar mensaje de confirmación
    this.snackBar.open(`Gestionando categoría: ${category.name}`, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  onUpdateCategoryStatus(categoryId: string, status: string): void {
    this.apiService.updateCategoryStatus(categoryId, status).subscribe({
      next: () => {
        this.loadCategories();
        this.snackBar.open('Estado actualizado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error updating category status:', error);
        const errorMessage = error.error?.error || 'Error al actualizar estado';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onGenerateFinalists(categoryId: string): void {
    this.apiService.generateFinalists(categoryId).subscribe({
      next: () => {
        this.loadCategories();
        this.snackBar.open('Finalistas generados exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error generating finalists:', error);
        const errorMessage = error.error?.error || 'Error al generar finalistas';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onDeleteCategory(category: any): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`)) {
      this.apiService.deleteCategory(category.id).subscribe({
        next: (response: any) => {
          this.snackBar.open('Categoría eliminada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadCategories();
          this.loadStats();
        },
        error: (error: any) => {
          console.error('Error deleting category:', error);
          this.snackBar.open('Error al eliminar categoría', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onResetSystem(): void {
    if (confirm('¿Estás seguro de que quieres reiniciar el sistema? Esto eliminará todos los datos existentes.')) {
      this.apiService.resetSystem().subscribe({
        next: () => {
          this.snackBar.open('Sistema reiniciado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadCategories();
          this.loadStats();
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error resetting system');
          this.snackBar.open('Error al reiniciar el sistema', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
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
      case 'NOMINATION': return 'Nominación';
      case 'SELECTION_FINALISTS': return 'Selección';
      case 'VOTING_FINAL': return 'Votación Final';
      case 'FINISHED': return 'Finalizada';
      default: return status;
    }
  }

  onReopenNominations(categoryId: string): void {
    if (confirm('¿Estás seguro de que quieres reabrir las nominaciones? Esto eliminará los finalistas y votos existentes.')) {
      this.apiService.reopenNominations(categoryId).subscribe({
        next: () => {
          this.loadCategories();
          this.snackBar.open('Nominaciones reabiertas exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error reopening nominations:', error);
          const errorMessage = error.error?.error || 'Error al reabrir nominaciones';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onReopenVoting(categoryId: string): void {
    if (confirm('¿Estás seguro de que quieres reabrir la votación? Esto eliminará los votos existentes.')) {
      this.apiService.reopenVoting(categoryId).subscribe({
        next: () => {
          this.loadCategories();
          this.snackBar.open('Votación reabierta exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error reopening voting:', error);
          const errorMessage = error.error?.error || 'Error al reabrir votación';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  startCeremony(): void {
    this.router.navigate(['/winners-reveal']);
  }

  startCategoryReveal(categoryId: string): void {
    this.router.navigate(['/winners-reveal'], { queryParams: { categoryId } });
  }

  onDeleteAllUsers(): void {
    const confirmText = 'ELIMINAR USUARIOS';
    const userInput = prompt(`⚠️ ACCIÓN PELIGROSA ⚠️\n\nEsto eliminará TODOS los usuarios participantes del sistema de forma PERMANENTE.\n\nSolo se mantendrán los administradores.\n\nPara confirmar, escribe exactamente: ${confirmText}`);

    if (userInput === confirmText) {
      this.apiService.deleteAllUsers().subscribe({
        next: (response: any) => {
          this.snackBar.open('Todos los usuarios participantes eliminados exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadCategories();
          this.loadStats();
        },
        error: (error: any) => {
          console.error('Error deleting users:', error);
          const errorMessage = error.error?.error || 'Error al eliminar usuarios';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else if (userInput !== null) {
      this.snackBar.open('Operación cancelada - Texto incorrecto', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}