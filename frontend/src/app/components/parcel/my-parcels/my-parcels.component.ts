import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ParcelService } from '../../../services/parcel.service';
import { AuthService } from '../../../services/auth.service';
import { Parcel, ParcelStatusNames, ParcelStatusBadge, PageResult } from '../../../models/parcel.model';

@Component({
  selector: 'app-my-parcels',
  templateUrl: './my-parcels.component.html',
  styleUrls: ['./my-parcels.component.css']
})
export class MyParcelsComponent implements OnInit {
  activeTab: 'published' | 'accepted' = 'published';
  publishedParcels: Parcel[] = [];
  acceptedParcels: Parcel[] = [];
  publishedPageResult!: PageResult<Parcel>;
  acceptedPageResult!: PageResult<Parcel>;
  loading = true;
  currentPage = 0;
  pageSize = 10;
  selectedStatus: number | null = null;

  statusOptions = [
    { value: null, label: '全部状态' },
    { value: 0, label: '待审核' },
    { value: 1, label: '待接单' },
    { value: 2, label: '已接单' },
    { value: 3, label: '配送中' },
    { value: 4, label: '已完成' },
    { value: 5, label: '已取消' }
  ];

  constructor(
    private parcelService: ParcelService,
    private authService: AuthService,
    private router: Router
  ) {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-parcels' } });
    }
  }

  ngOnInit(): void {
    this.loadPublishedParcels();
  }

  switchTab(tab: 'published' | 'accepted'): void {
    this.activeTab = tab;
    this.currentPage = 0;
    this.selectedStatus = null;
    
    if (tab === 'published') {
      this.loadPublishedParcels();
    } else {
      this.loadAcceptedParcels();
    }
  }

  onStatusChange(): void {
    this.currentPage = 0;
    this.loadCurrentParcels();
  }

  loadCurrentParcels(): void {
    if (this.activeTab === 'published') {
      this.loadPublishedParcels();
    } else {
      this.loadAcceptedParcels();
    }
  }

  loadPublishedParcels(): void {
    this.loading = true;
    this.parcelService.getMyPublishedParcels(
      this.selectedStatus !== null ? this.selectedStatus : undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.publishedPageResult = response.data;
          this.publishedParcels = response.data.content;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadAcceptedParcels(): void {
    this.loading = true;
    this.parcelService.getMyAcceptedParcels(
      this.selectedStatus !== null ? this.selectedStatus : undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.acceptedPageResult = response.data;
          this.acceptedParcels = response.data.content;
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
    this.loadCurrentParcels();
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
    this.router.navigate(['/parcels/create']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/parcels', id]);
  }

  goToParcels(): void {
    this.router.navigate(['/parcels']);
  }

  getCurrentParcels(): Parcel[] {
    return this.activeTab === 'published' ? this.publishedParcels : this.acceptedParcels;
  }

  getCurrentPageResult(): PageResult<Parcel> | null {
    if (this.activeTab === 'published') {
      return this.publishedPageResult || null;
    }
    return this.acceptedPageResult || null;
  }
}
