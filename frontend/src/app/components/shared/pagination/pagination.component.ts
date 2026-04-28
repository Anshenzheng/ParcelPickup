import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PageResult } from '../../../models/common.model';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() pageResult!: PageResult<any>;
  @Output() pageChange = new EventEmitter<number>();

  get currentPage(): number {
    return this.pageResult?.pageNumber ?? 0;
  }

  get totalPages(): number {
    return this.pageResult?.totalPages ?? 0;
  }

  get totalElements(): number {
    return this.pageResult?.totalElements ?? 0;
  }

  get isFirst(): boolean {
    return this.pageResult?.first ?? true;
  }

  get isLast(): boolean {
    return this.pageResult?.last ?? true;
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];
    
    if (total <= 5) {
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      if (current < 2) {
        for (let i = 0; i < 5; i++) {
          pages.push(i);
        }
      } else if (current >= total - 3) {
        for (let i = total - 5; i < total; i++) {
          pages.push(i);
        }
      } else {
        for (let i = current - 2; i <= current + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  goToFirst(): void {
    if (!this.isFirst) {
      this.pageChange.emit(0);
    }
  }

  goToLast(): void {
    if (!this.isLast) {
      this.pageChange.emit(this.totalPages - 1);
    }
  }

  goToPrev(): void {
    if (!this.isFirst) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  goToNext(): void {
    if (!this.isLast) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}
