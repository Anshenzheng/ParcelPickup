export interface Parcel {
  id: number;
  orderNo: string;
  publisherId: number;
  acceptorId: number;
  expressPointId: number;
  pickupCode: string;
  deliveryAddress: string;
  contactPerson: string;
  contactPhone: string;
  reward: number;
  parcelType: string;
  weight: number;
  remark: string;
  status: number;
  adminRemark: string;
  reviewedBy: number;
  reviewedAt: string;
  acceptedAt: string;
  deliveredAt: string;
  completedAt: string;
  cancelledAt: string;
  createdAt: string;
  updatedAt: string;
  publisher?: User;
  acceptor?: User;
  expressPoint?: ExpressPoint;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  realName: string;
  studentId: string;
  avatar: string;
  status: number;
}

export interface ExpressPoint {
  id: number;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  openTime: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParcelCreateRequest {
  expressPointId: number;
  pickupCode: string;
  deliveryAddress: string;
  contactPerson: string;
  contactPhone: string;
  reward: number;
  parcelType?: string;
  weight?: number;
  remark?: string;
}

export interface PageResult<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ParcelLog {
  id: number;
  parcelId: number;
  userId: number;
  action: string;
  oldStatus: number;
  newStatus: number;
  remark: string;
  createdAt: string;
  user?: User;
}

export interface Statistics {
  totalParcels: number;
  pendingReview: number;
  pendingAccept: number;
  accepted: number;
  delivering: number;
  completed: number;
  cancelled: number;
  removed: number;
  completionRate: string;
}

export interface DailyData {
  date: string;
  newOrders: number;
  completedOrders: number;
  totalRewards: number;
}

export interface DailyStatistics {
  dailyData: DailyData[];
}

export const ParcelStatus = {
  PENDING_REVIEW: 0,
  PENDING_ACCEPT: 1,
  ACCEPTED: 2,
  DELIVERING: 3,
  COMPLETED: 4,
  CANCELLED: 5,
  REMOVED: 6
};

export const ParcelStatusNames: { [key: number]: string } = {
  0: '待审核',
  1: '待接单',
  2: '已接单',
  3: '配送中',
  4: '已完成',
  5: '已取消',
  6: '已下架'
};

export const ParcelStatusBadge: { [key: number]: string } = {
  0: 'badge-warning',
  1: 'badge-primary',
  2: 'badge-primary',
  3: 'badge-warning',
  4: 'badge-success',
  5: 'badge-secondary',
  6: 'badge-danger'
};
