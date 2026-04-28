import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { Statistics, DailyStatistics, DailyData } from '../../../models/parcel.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  statistics!: Statistics;
  dailyStatistics!: DailyStatistics;
  loading = true;
  daysRange = 7;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {
    if (!this.authService.isAuthenticated || !this.authService.isAdmin) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadDailyStatistics();
  }

  loadStatistics(): void {
    this.adminService.getStatistics().subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.statistics = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadDailyStatistics(): void {
    this.adminService.getDailyStatistics(this.daysRange).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.dailyStatistics = response.data;
        }
      },
      error: () => {}
    });
  }

  onDaysChange(): void {
    this.loadDailyStatistics();
  }

  exportStatistics(): void {
    this.adminService.exportStatistics().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statistics_${new Date().toISOString().split('T')[0]}.json`;
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

  getTotalOrders(): number {
    if (!this.statistics) return 0;
    return this.statistics.totalParcels;
  }

  getCompletionRate(): string {
    if (!this.statistics) return '0%';
    return this.statistics.completionRate;
  }

  getDailyData(): DailyData[] {
    if (!this.dailyStatistics || !this.dailyStatistics.dailyData) return [];
    return this.dailyStatistics.dailyData;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    });
  }
}
