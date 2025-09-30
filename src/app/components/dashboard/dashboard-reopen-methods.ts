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
          this.snackBar.open('Error al reabrir nominaciones', 'Cerrar', {
            duration: 3000,
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
          this.snackBar.open('Error al reabrir votación', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }