import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Result, Page, AuxiliaryStock, WastewaterDailyQuota, WastewaterLog, ProductionSchedule } from '../models';

@Injectable({ providedIn: 'root' })
export class WastewaterService {

  constructor(private http: HttpClient) {}

  pageQuota(pageNum: number = 1, pageSize: number = 10): Observable<Page<WastewaterDailyQuota>> {
    let params = new HttpParams()
      .set('pageNum', pageNum.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<Result<Page<WastewaterDailyQuota>>>(`${environment.apiBaseUrl}/wastewater/quota/page`, { params })
      .pipe(map(res => res.data));
  }

  getTodayQuota(): Observable<WastewaterDailyQuota> {
    return this.http.get<Result<WastewaterDailyQuota>>(`${environment.apiBaseUrl}/wastewater/quota/today`)
      .pipe(map(res => res.data));
  }

  getAvailableQuotas(requiredCod: number, daysAhead: number = 7): Observable<WastewaterDailyQuota[]> {
    const params = new HttpParams()
      .set('requiredCod', requiredCod.toString())
      .set('daysAhead', daysAhead.toString());
    return this.http.get<Result<WastewaterDailyQuota[]>>(`${environment.apiBaseUrl}/wastewater/quota/available`, { params })
      .pipe(map(res => res.data));
  }

  pageSchedule(pageNum: number = 1, pageSize: number = 10, status?: string, startDate?: string, endDate?: string): Observable<Page<ProductionSchedule>> {
    let params = new HttpParams()
      .set('pageNum', pageNum.toString())
      .set('pageSize', pageSize.toString());
    if (status) params = params.set('status', status);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<Result<Page<ProductionSchedule>>>(`${environment.apiBaseUrl}/wastewater/schedule/page`, { params })
      .pipe(map(res => res.data));
  }

  pageStock(pageNum: number = 1, pageSize: number = 10, auxiliaryId?: number, warehouse?: string): Observable<Page<AuxiliaryStock>> {
    let params = new HttpParams()
      .set('pageNum', pageNum.toString())
      .set('pageSize', pageSize.toString());
    if (auxiliaryId) params = params.set('auxiliaryId', auxiliaryId.toString());
    if (warehouse) params = params.set('warehouse', warehouse);
    return this.http.get<Result<Page<AuxiliaryStock>>>(`${environment.apiBaseUrl}/stock/page`, { params })
      .pipe(map(res => res.data));
  }
}
