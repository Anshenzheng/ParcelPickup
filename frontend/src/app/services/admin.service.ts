import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Parcel, PageResult, Statistics, DailyStatistics, ParcelLog } from '../models/parcel.model';
import { User, UserDTO } from '../models/user.model';
import { Result } from '../models/common.model';

const API_URL = 'http://localhost:8080/api/admin/';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getAllParcels(status?: number, page: number = 0, size: number = 10): Observable<Result<PageResult<Parcel>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    return this.http.get<Result<PageResult<Parcel>>>(API_URL + 'parcels', { params });
  }

  reviewParcel(id: number, approved: boolean, remark?: string): Observable<Result<Parcel>> {
    let params = new HttpParams()
      .set('approved', approved.toString());
    if (remark) {
      params = params.set('remark', remark);
    }
    return this.http.post<Result<Parcel>>(API_URL + 'parcels/' + id + '/review', {}, { params });
  }

  removeParcel(id: number, reason?: string): Observable<Result<Parcel>> {
    let params = new HttpParams();
    if (reason) {
      params = params.set('reason', reason);
    }
    return this.http.post<Result<Parcel>>(API_URL + 'parcels/' + id + '/remove', {}, { params });
  }

  getStatistics(): Observable<Result<Statistics>> {
    return this.http.get<Result<Statistics>>(API_URL + 'statistics');
  }

  getDailyStatistics(days: number = 7): Observable<Result<DailyStatistics>> {
    let params = new HttpParams().set('days', days.toString());
    return this.http.get<Result<DailyStatistics>>(API_URL + 'daily-statistics', { params });
  }

  getAllUsers(status?: number, page: number = 0, size: number = 10): Observable<Result<PageResult<UserDTO>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    return this.http.get<Result<PageResult<UserDTO>>>(API_URL + 'users', { params });
  }

  updateUserStatus(id: number, status: number): Observable<Result<User>> {
    let params = new HttpParams().set('status', status.toString());
    return this.http.put<Result<User>>(API_URL + 'users/' + id + '/status', {}, { params });
  }

  exportParcels(status?: number): Observable<Blob> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    return this.http.get(API_URL + 'export/parcels', { params, responseType: 'blob' });
  }

  exportStatistics(): Observable<Blob> {
    return this.http.get(API_URL + 'export/statistics', { responseType: 'blob' });
  }
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  phone: string;
  realName: string;
  studentId: string;
  avatar: string;
  status: number;
  roles: string[];
}
