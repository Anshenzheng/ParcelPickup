import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParcelService } from '../../../services/parcel.service';
import { AuthService } from '../../../services/auth.service';
import { Parcel, ParcelStatusNames, ParcelStatusBadge, ParcelStatus, ParcelLog } from '../../../models/parcel.model';

@Component({
  selector: 'app-parcel-detail',
  templateUrl: './parcel-detail.component.html',
  styleUrls: ['./parcel-detail.component.css']
})
export class ParcelDetailComponent implements OnInit {
  parcel!: Parcel;
  logs: ParcelLog[] = [];
  loading = true;
  loadingLogs = false;
  error = '';
  isAuthenticated = false;
  currentUserId: number | null = null;
  isPublisher = false;
  isAcceptor = false;
  canAccept = false;
  canStartDelivery = false;
  canComplete = false;
  canCancel = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parcelService: ParcelService,
    private authService: AuthService
  ) {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id || null;
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadParcel(+id);
    }
  }

  loadParcel(id: number): void {
    this.loading = true;
    this.error = '';
    
    this.parcelService.getParcelById(id).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.parcel = response.data;
          this.updatePermissions();
          this.loadLogs(id);
        } else {
          this.error = response.message || '加载失败';
        }
        this.loading = false;
      },
      error: () => {
        this.error = '加载订单详情失败';
        this.loading = false;
      }
    });
  }

  loadLogs(id: number): void {
    this.loadingLogs = true;
    this.parcelService.getParcelLogs(id).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.logs = response.data;
        }
        this.loadingLogs = false;
      },
      error: () => {
        this.loadingLogs = false;
      }
    });
  }

  updatePermissions(): void {
    if (!this.currentUserId || !this.parcel) {
      return;
    }
    
    this.isPublisher = this.currentUserId === this.parcel.publisherId;
    this.isAcceptor = this.currentUserId === this.parcel.acceptorId;
    
    this.canAccept = this.isAuthenticated && 
                     this.parcel.status === ParcelStatus.PENDING_ACCEPT && 
                     !this.isPublisher && 
                     !this.parcel.acceptorId;
    
    this.canStartDelivery = this.isAcceptor && this.parcel.status === ParcelStatus.ACCEPTED;
    this.canComplete = this.isAcceptor && this.parcel.status === ParcelStatus.DELIVERING;
    this.canCancel = this.isPublisher && 
                     (this.parcel.status === ParcelStatus.PENDING_REVIEW || 
                      this.parcel.status === ParcelStatus.PENDING_ACCEPT);
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

  acceptParcel(): void {
    if (!confirm('确定要接取这个订单吗？')) {
      return;
    }
    
    this.parcelService.acceptParcel(this.parcel.id).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.parcel = response.data;
          this.updatePermissions();
          this.loadLogs(this.parcel.id);
        } else {
          alert(response.message || '接单失败');
        }
      },
      error: (error) => {
        alert(error.error?.message || '接单失败，请稍后重试');
      }
    });
  }

  startDelivery(): void {
    if (!confirm('确定要开始配送吗？')) {
      return;
    }
    
    this.parcelService.startDelivery(this.parcel.id).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.parcel = response.data;
          this.updatePermissions();
          this.loadLogs(this.parcel.id);
        } else {
          alert(response.message || '操作失败');
        }
      },
      error: (error) => {
        alert(error.error?.message || '操作失败，请稍后重试');
      }
    });
  }

  completeParcel(): void {
    if (!confirm('确定要完成订单吗？确认已成功送达。')) {
      return;
    }
    
    this.parcelService.completeParcel(this.parcel.id).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.parcel = response.data;
          this.updatePermissions();
          this.loadLogs(this.parcel.id);
        } else {
          alert(response.message || '操作失败');
        }
      },
      error: (error) => {
        alert(error.error?.message || '操作失败，请稍后重试');
      }
    });
  }

  cancelParcel(): void {
    const reason = prompt('请输入取消原因：');
    if (reason === null) {
      return;
    }
    
    this.parcelService.cancelParcel(this.parcel.id, reason || '用户取消').subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.parcel = response.data;
          this.updatePermissions();
          this.loadLogs(this.parcel.id);
        } else {
          alert(response.message || '取消失败');
        }
      },
      error: (error) => {
        alert(error.error?.message || '取消失败，请稍后重试');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/parcels']);
  }
}
