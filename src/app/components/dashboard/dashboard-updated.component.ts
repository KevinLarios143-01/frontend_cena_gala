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
        
        // Mostrar mensaje de error específico
        let errorMessage = 'Error al actualizar estado';
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }