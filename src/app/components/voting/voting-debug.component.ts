  loadParticipants(categoryId: string): void {
    console.log('=== LOADING PARTICIPANTS ===');
    console.log('Category ID:', categoryId);
    
    this.apiService.getParticipantsByCategory(categoryId).subscribe({
      next: (participants) => {
        console.log('Participants loaded for category', categoryId, ':', participants);
        console.log('Number of participants:', participants.length);
        this.participants[categoryId] = participants;
        
        // Debug: Show current participants object
        console.log('Current participants object:', this.participants);
      },
      error: (error) => {
        console.error('Error loading participants for category', categoryId, ':', error);
      }
    });
  }