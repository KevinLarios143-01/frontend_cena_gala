import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { convertDriveUrl } from '../../utils/drive-url.util';
import { extractImageName } from '../../utils/image-name.util';

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>edit</mat-icon>
      Editar Usuario
    </h2>
    
    <mat-dialog-content>
      <div class="user-preview">
        <img *ngIf="data.imageUrl" [src]="data.imageUrl" [alt]="data.name" class="preview-photo">
        <div *ngIf="!data.imageUrl" class="preview-placeholder">
          {{ data.name.charAt(0).toUpperCase() }}
        </div>
        <div class="user-info">
          <h3>{{ data.name }}</h3>
          <p>{{ data.email }}</p>
        </div>
      </div>

      <form [formGroup]="userForm">
        <div class="upload-section">
          <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none">
          <button mat-raised-button type="button" (click)="fileInput.click()">
            <mat-icon>upload</mat-icon>
            Subir Imagen
          </button>
          <span *ngIf="selectedFile" class="file-name">{{ selectedFile.name }}</span>
        </div>

        <mat-form-field appearance="outline" *ngIf="!selectedFile">
          <mat-label>O usar imagen existente</mat-label>
          <input matInput formControlName="imageUrl" placeholder="admin-juan.jpg">
          <mat-icon matSuffix>image</mat-icon>
          <mat-hint>Nombre del archivo ya subido a Firebase</mat-hint>
        </mat-form-field>

        <div *ngIf="previewUrl || userForm.get('imageUrl')?.value || data.imageUrl" class="photo-preview">
          <img [src]="previewUrl || userForm.get('imageUrl')?.value || data.imageUrl" [alt]="data.name" 
               (error)="onImageError()" class="new-photo">
          <p class="image-display-name" *ngIf="!selectedFile && (userForm.get('imageUrl')?.value || data.imageUrl)">
            Imagen actual
          </p>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!userForm.valid">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-preview {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .preview-photo, .preview-placeholder {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 2px solid #d4af37;
    }
    .preview-photo { object-fit: cover; }
    .preview-placeholder {
      background: linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #64748b;
      font-size: 24px;
    }
    .user-info h3 { margin: 0; color: #2d2d2d; }
    .user-info p { margin: 4px 0 0 0; color: #666; }
    mat-form-field { width: 100%; margin-bottom: 16px; }
    .photo-preview { text-align: center; margin-top: 16px; }
    .new-photo {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #d4af37;
    }
    .upload-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .file-name {
      color: #666;
      font-size: 0.9rem;
    }
    .image-display-name {
      color: #666;
      font-size: 0.8rem;
      margin: 8px 0 0 0;
      text-align: center;
    }
  `]
})
export class UserEditDialogComponent {
  userForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userForm = this.fb.group({
      imageUrl: [data.imageUrl || '']
    });
  }

  onImageError(): void {
    this.snackBar.open('Error al cargar la imagen', 'Cerrar', { duration: 3000 });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  convertDriveUrl = convertDriveUrl;

  getImageUrl(filename: string): string {
    if (!filename) return '';
    return `https://firebasestorage.googleapis.com/v0/b/fl-farms-gl.firebasestorage.app/o/images%2Fusers%2F${encodeURIComponent(filename)}?alt=media`;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      // Limpiar campo de texto
      this.userForm.patchValue({ imageUrl: '' });
    }
  }

  getDisplayName(filename: string): string {
    return extractImageName(filename);
  }

  onSave(): void {
    if (this.selectedFile) {
      // 1. Subir archivo a Firebase Storage
      this.apiService.uploadUserPhoto(this.data.id, this.selectedFile).subscribe({
        next: (firebaseUrl) => {
          // 2. Guardar la URL de Firebase en la base de datos
          this.apiService.updateUserPhoto(this.data.id, firebaseUrl).subscribe({
            next: () => {
              this.snackBar.open('Foto subida y actualizada exitosamente', 'Cerrar', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: () => {
              this.snackBar.open('Error al actualizar foto en base de datos', 'Cerrar', { duration: 3000 });
            }
          });
        },
        error: () => {
          this.snackBar.open('Error al subir foto a Firebase', 'Cerrar', { duration: 3000 });
        }
      });
    } else if (this.userForm.valid && this.userForm.get('imageUrl')?.value) {
      // Usar imagen existente
      const filename = this.userForm.get('imageUrl')?.value;
      const imageUrl = this.getImageUrl(filename);
      
      this.apiService.updateUserPhoto(this.data.id, imageUrl).subscribe({
        next: () => {
          this.snackBar.open('Foto actualizada exitosamente', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error al actualizar foto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}