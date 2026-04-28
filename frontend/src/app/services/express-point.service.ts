import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpressPoint, PageResult } from '../models/parcel.model';
import { Result } from '../models/common.model';

const API_URL = 'http://localhost:8080/api/express-points/';

@Injectable({
  providedIn: 'root'
})
export class ExpressPointService {

  constructor(private http: HttpClient) { }

  getActiveExpressPoints(): Observable<Result<ExpressPoint[]>> {
    return this.http.get<Result<ExpressPoint[]>>(API_URL + 'active');
  }

  getAllExpressPoints(page: number = 0, size: number = 10): Observable<Result<PageResult<ExpressPoint>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Result<PageResult<ExpressPoint>>>(API_URL, { params });
  }

  getExpressPointById(id: number): Observable<Result<ExpressPoint>> {
    return this.http.get<Result<ExpressPoint>>(API_URL + id);
  }

  createExpressPoint(point: ExpressPoint): Observable<Result<ExpressPoint>> {
    return this.http.post<Result<ExpressPoint>>(API_URL, point);
  }

  updateExpressPoint(id: number, point: ExpressPoint): Observable<Result<ExpressPoint>> {
    return this.http.put<Result<ExpressPoint>>(API_URL + id, point);
  }

  updateStatus(id: number, status: number): Observable<Result<string>> {
    let params = new HttpParams().set('status', status.toString());
    return this.http.put<Result<string>>(API_URL + id + '/status', {}, { params });
  }

  deleteExpressPoint(id: number): Observable<Result<string>> {
    return this.http.delete<Result<string>>(API_URL + id);
  }
}
