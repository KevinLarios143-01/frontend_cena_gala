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
        
        // Mostrar mensaje de error específico
        let errorMessage = 'Error al generar finalistas';
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