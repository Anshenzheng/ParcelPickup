import { Component, OnInit } from '@angular/core';
import { ParcelService } from '../../services/parcel.service';
import { Parcel, ParcelStatusNames, ParcelStatusBadge } from '../../models/parcel.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  recentParcels: Parcel[] = [];
  loading = true;
  isAuthenticated = false;

  constructor(
    private parcelService: ParcelService,
    private authService: AuthService
  ) {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }

  ngOnInit(): void {
    this.loadRecentParcels();
  }

  loadRecentParcels(): void {
    this.loading = true;
    this.parcelService.getAvailableParcels(0, 6).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.recentParcels = response.data.content;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
}
