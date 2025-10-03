import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-winners-reveal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './winners-reveal.component.html',
  styleUrl: './winners-reveal.component.css',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(100px)', opacity: 0 }),
        animate('500ms ease-in', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class WinnersRevealComponent implements OnInit {
  categories: any[] = [];
  currentCategoryIndex = 0;
  showWinner = false;
  isRevealing = false;
  showConfetti = false;
  singleCategoryMode = false;
  categoryId: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['categoryId'];
      this.singleCategoryMode = !!this.categoryId;
      this.loadFinishedCategories();
    });
  }

  loadFinishedCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        if (this.singleCategoryMode && this.categoryId) {
          this.categories = categories.filter(cat => cat.id === this.categoryId && cat.status === 'FINISHED');
        } else {
          this.categories = categories.filter(cat => cat.status === 'FINISHED');
        }
        this.loadCategoryResults();
      },
      error: (error) => {
        console.error('Error loading categories');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadCategoryResults(): void {
    this.categories.forEach(category => {
      this.apiService.getVoteResults(category.id).subscribe({
        next: (results) => {
          if (results && results.length > 0) {
            const winner = results[0];
            // Asegurar que tenemos la estructura correcta
            category.winner = {
              participant: winner.participant,
              _count: winner._count
            };
            console.log('Winner data:', category.winner);
            console.log('Image URL:', winner.participant?.imageUrl);
          } else {
            category.winner = null;
          }
        },
        error: (error) => {
          console.error('Error loading results:', error);
          category.winner = null;
        }
      });
    });
  }

  startReveal(): void {
    this.currentCategoryIndex = 0;
    this.revealNextCategory();
  }

  revealNextCategory(): void {
    if (this.currentCategoryIndex >= this.categories.length) {
      this.showFinalCelebration();
      return;
    }

    this.showWinner = false;
    this.isRevealing = true;
    this.showConfetti = false;

    setTimeout(() => {
      this.showWinner = true;
      this.showConfetti = true;
      this.isRevealing = false;
    }, 3000);
  }

  nextCategory(): void {
    this.currentCategoryIndex++;
    this.revealNextCategory();
  }

  showFinalCelebration(): void {
    this.showConfetti = true;
  }

  getCurrentCategory(): any {
    return this.categories[this.currentCategoryIndex];
  }

  getImageUrl(imageUrl: string): string {
    console.log('Getting image URL for:', imageUrl);
    
    if (!imageUrl) {
      console.log('No image URL provided');
      return '';
    }
    
    // Si ya es una URL completa (http/https), devolverla tal como está
    if (imageUrl.startsWith('http')) {
      console.log('Using full URL:', imageUrl);
      return imageUrl;
    }
    
    // Si es solo un nombre de archivo, construir la URL de Firebase usando la ruta de usuarios
    const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/fl-farms-gl.firebasestorage.app/o/images%2Fusers%2F${encodeURIComponent(imageUrl)}?alt=media`;
    console.log('Constructed Firebase URL:', firebaseUrl);
    return firebaseUrl;
  }

  onImageError(event: any): void {
    console.error('Image failed to load:', event.target.src);
    // Ocultar la imagen y mostrar el placeholder
    event.target.style.display = 'none';
    const placeholder = event.target.parentElement.querySelector('.ceremony-winner-placeholder');
    if (placeholder) {
      placeholder.style.display = 'inline-flex';
    }
  }

  onImageLoad(event: any): void {
    console.log('Image loaded successfully:', event.target.src);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']).catch(() => {
      window.location.href = '/dashboard';
    });
  }
}