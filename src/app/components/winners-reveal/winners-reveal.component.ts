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
          category.winner = results && results.length > 0 ? results[0] : null;
        },
        error: (error) => {
          console.error('Error loading results');
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

  goBack(): void {
    this.router.navigate(['/dashboard']).catch(() => {
      window.location.href = '/dashboard';
    });
  }
}