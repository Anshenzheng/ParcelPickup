import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Parcel, ParcelCreateRequest, PageResult, ParcelLog, Statistics, DailyStatistics } from '../models/parcel.model';
import { Result } from '../models/common.model';

const API_URL = 'http://localhost:8080/api/parcels/';

@Injectable({
  providedIn: 'root'
})
export class ParcelService {

  constructor(private http: HttpClient) { }

  createParcel(request: ParcelCreateRequest): Observable<Result<Parcel>> {
    return this.http.post<Result<Parcel>>(API_URL, request);
  }

  getAvailableParcels(page: number = 0, size: number = 10): Observable<Result<PageResult<Parcel>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Result<PageResult<Parcel>>>(API_URL + 'available', { params });
  }

  getMyPublishedParcels(status?: number, page: number = 0, size: number = 10): Observable<Result<PageResult<Parcel>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    return this.http.get<Result<PageResult<Parcel>>>(API_URL + 'my-published', { params });
  }

  getMyAcceptedParcels(status?: number, page: number = 0, size: number = 10): Observable<Result<PageResult<Parcel>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    return this.http.get<Result<PageResult<Parcel>>>(API_URL + 'my-accepted', { params });
  }

  getParcelById(id: number): Observable<Result<Parcel>> {
    return this.http.get<Result<Parcel>>(API_URL + id);
  }

  acceptParcel(id: number): Observable<Result<Parcel>> {
    return this.http.post<Result<Parcel>>(API_URL + id + '/accept', {});
  }

  startDelivery(id: number): Observable<Result<Parcel>> {
    return this.http.post<Result<Parcel>>(API_URL + id + '/start-delivery', {});
  }

  completeParcel(id: number): Observable<Result<Parcel>> {
    return this.http.post<Result<Parcel>>(API_URL + id + '/complete', {});
  }

  cancelParcel(id: number, reason?: string): Observable<Result<Parcel>> {
    return this.http.post<Result<Parcel>>(API_URL + id + '/cancel', reason || '用户取消');
  }

  getParcelLogs(id: number): Observable<Result<ParcelLog[]>> {
    return this.http.get<Result<ParcelLog[]>>(API_URL + id + '/logs');
  }
}
