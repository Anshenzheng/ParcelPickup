import { Component, OnInit } from '@angular/core';
import { ParcelService } from '../../../services/parcel.service';
import { Parcel, ParcelStatusNames, ParcelStatusBadge, PageResult } from '../../../models/parcel.model';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parcel-list',
  templateUrl: './parcel-list.component.html',
  styleUrls: ['./parcel-list.component.css']
})
export class ParcelListComponent implements OnInit {
  parcels: Parcel[] = [];
  pageResult!: PageResult<Parcel>;
  loading = true;
  isAuthenticated = false;
  currentPage = 0;
  pageSize = 10;

  constructor(
    private parcelService: ParcelService,
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }

  ngOnInit(): void {
    this.loadParcels();
  }

  loadParcels(): void {
    this.loading = true;
    this.parcelService.getAvailableParcels(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.pageResult = response.data;
          this.parcels = response.data.content;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadParcels();
  }

  getStatusName(status: number): string {
    return ParcelStatusNames[status] || '未知';
  }

  getStatusBadge(status: number): string {
    return ParcelStatusBadge[status] || 'badge-secondary';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToCreate(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/parcels/create']);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/parcels/create' } });
    }
  }
}
