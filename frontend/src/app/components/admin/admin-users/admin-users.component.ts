import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, UserDTO } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { PageResult } from '../../../models/common.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: UserDTO[] = [];
  pageResult!: PageResult<UserDTO>;
  loading = true;
  currentPage = 0;
  pageSize = 10;
  selectedStatus: number | null = null;

  statusOptions = [
    { value: null, label: '全部状态' },
    { value: 1, label: '正常' },
    { value: 0, label: '禁用' }
  ];

  constructor(
    private router: Router,
    private adminService: AdminService,
    private authService: AuthService
  ) {
    if (!this.authService.isAuthenticated || !this.authService.isAdmin) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getAllUsers(
      this.selectedStatus !== null ? this.selectedStatus : undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.pageResult = response.data;
          this.users = response.data.content;
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
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
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

  getStatusName(status: number): string {
    return status === 1 ? '正常' : '禁用';
  }

  getStatusBadge(status: number): string {
    return status === 1 ? 'badge-success' : 'badge-danger';
  }

  toggleUserStatus(user: UserDTO): void {
    const newStatus = user.status === 1 ? 0 : 1;
    const action = newStatus === 1 ? '启用' : '禁用';
    
    if (!confirm(`确定要${action}该用户吗？`)) {
      return;
    }
    
    this.adminService.updateUserStatus(user.id, newStatus).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.loadUsers();
        } else {
          alert(response.message || '操作失败');
        }
      },
      error: (error) => {
        alert(error.error?.message || '操作失败，请稍后重试');
      }
    });
  }

  isAdmin(user: UserDTO): boolean {
    return user.roles?.includes('ROLE_ADMIN') || false;
  }
}
