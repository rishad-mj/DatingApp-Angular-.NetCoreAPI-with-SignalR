import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiError } from '../../../Types/ApiError';

@Component({
  selector: 'app-serer-error',
  imports: [],
  templateUrl: './serer-error.html',
  styleUrl: './serer-error.css',
})
export class SererError {
  protected error: ApiError | undefined;
  private router = inject(Router);
  protected showDetails = false;

  constructor() {
    const navigation = this.router.currentNavigation();
    this.error = navigation?.extras.state?.['error'];
  }

  detailsToggle() {
    this.showDetails = !this.showDetails;
  }
}
