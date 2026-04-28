import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { Parcel, ParcelStatusNames, ParcelStatusBadge, PageResult } from '../../../models/parcel.model';

@Component({
  selector: 'app-admin-parcels',
  templateUrl: './admin-parcels.component.html',
  styleUrls: ['./admin-parcels.component.css']
})
export class AdminParcelsComponent implements OnInit {
  parcels: Parcel[] = [];
  pageResult!: PageResult<Parcel>;
  loading = true;
  currentPage = 0;
  pageSize = 10;
  selectedStatus: number | null = null;
  showReviewModal = false;
  selectedParcel: Parcel | null = null;
  reviewRemark = '';

  statusOptions = [
    { value: null, label: '全部状态' },
    { value: 0, label: '待审核' },
    { value: 1, label: '待接单' },
    { value: 2, label: '已接单' },
    { value: 3, label: '配送中' },
    { value: 4, label: '已完成' },
    { value: 5, label: '已取消' },
    { value: 6, label: '已下架' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private authService: AuthService
  ) {
    if (!this.authService.isAuthenticated || !this.authService.isAdmin) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit(): void {
    const statusParam = this.route.snapshot.queryParamMap.get('status');
    if (statusParam !== null) {
      this.selectedStatus = +statusParam;
    }
    this.loadParcels();
  }

  loadParcels(): void {
    this.loading = true;
    this.adminService.getAllParcels(
      this.selectedStatus !== null ? this.selectedStatus : undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
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

  onStatusChange(): void {
    this.currentPage = 0;
    this.loadParcels();
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

  openReviewModal(parcel: Parcel): void {
    this.selectedParcel = parcel;
    this.reviewRemark = '';
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedParcel = null;
    this.reviewRemark = '';
  }

  approveParcel(): void {
    if (!this.selectedParcel) return;
    
    this.adminService.reviewParcel(
      this.selectedParcel.id,
      true,
      this.reviewRemark || '审核通过'
    ).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.closeReviewModal();
          this.loadParcels();
        } else {
          alert(response.message || '操作失败');
        }
      },
      error: (error) => {
        alert(error.error?.message || '操作失败，请稍后重试');
      }
    });
  }

  rejectParcel(): void {
    if (!this.selectedParcel) return;
    
    this.adminService.reviewParcel(
      this.selectedParcel.id,
      false,
      this.reviewRemark || '审核不通过'
    ).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.closeReviewModal();
          this.loadParcels();
        } else {
          alert(response.message || '操作失败');
        }
      },
      error: (error) => {
        alert(error.error?.message || '操作失败，请稍后重试');
      }
    });
  }

  removeParcel(parcel: Parcel): void {
    const reason = prompt('请输入下架原因：');
    if (reason === null) {
      return;
    }
    
    this.adminService.removeParcel(
      parcel.id,
      reason || '管理员下架'
    ).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.loadParcels();
        } else {
          alert(response.message || '操作失败');
        }
      },
      error: (error) => {
        alert(error.error?.message || '操作失败，请稍后重试');
      }
    });
  }

  exportParcels(): void {
    this.adminService.exportParcels(
      this.selectedStatus !== null ? this.selectedStatus : undefined
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `parcels_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        alert('导出失败，请稍后重试');
      }
    });
  }

  goToDetail(parcel: Parcel): void {
    this.router.navigate(['/parcels', parcel.id]);
  }
}
