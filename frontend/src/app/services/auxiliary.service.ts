import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Result, Page, Auxiliary } from '../models';

@Injectable({ providedIn: 'root' })
export class AuxiliaryService {

  constructor(private http: HttpClient) {}

  page(pageNum: number = 1, pageSize: number = 10, keyword?: string, forbiddenFlag?: number): Observable<Page<Auxiliary>> {
    let params = new HttpParams()
      .set('pageNum', pageNum.toString())
      .set('pageSize', pageSize.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (forbiddenFlag !== undefined && forbiddenFlag !== null) params = params.set('forbiddenFlag', forbiddenFlag.toString());
    return this.http.get<Result<Page<Auxiliary>>>(`${environment.apiBaseUrl}/auxiliary/page`, { params })
      .pipe(map(res => res.data));
  }

  listAvailable(): Observable<Auxiliary[]> {
    return this.http.get<Result<Auxiliary[]>>(`${environment.apiBaseUrl}/auxiliary/list/available`)
      .pipe(map(res => res.data));
  }

  listForbidden(): Observable<Auxiliary[]> {
    return this.http.get<Result<Auxiliary[]>>(`${environment.apiBaseUrl}/auxiliary/list/forbidden`)
      .pipe(map(res => res.data));
  }

  getById(id: number): Observable<Auxiliary> {
    return this.http.get<Result<Auxiliary>>(`${environment.apiBaseUrl}/auxiliary/${id}`)
      .pipe(map(res => res.data));
  }

  getBatchStockQuantity(auxiliaryIds: number[]): Observable<Record<number, number>> {
    const params = new HttpParams()
      .set('auxiliaryIds', auxiliaryIds.join(','));
    return this.http.get<Result<Record<number, number>>>(`${environment.apiBaseUrl}/stock/batch/quantity`, { params })
      .pipe(map(res => res.data));
  }

  save(auxiliary: Auxiliary): Observable<boolean> {
    return this.http.post<Result<boolean>>(`${environment.apiBaseUrl}/auxiliary/save`, auxiliary)
      .pipe(map(res => res.data));
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<Result<boolean>>(`${environment.apiBaseUrl}/auxiliary/${id}`)
      .pipe(map(res => res.data));
  }
}
