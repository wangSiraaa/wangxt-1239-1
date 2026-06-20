import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Result, Page, FormulaDetailVO, FormulaVO, DyeingFormula } from '../models';

@Injectable({ providedIn: 'root' })
export class FormulaService {

  constructor(private http: HttpClient) {}

  page(pageNum: number = 1, pageSize: number = 10, keyword?: string, status?: string): Observable<Page<FormulaVO>> {
    let params = new HttpParams()
      .set('pageNum', pageNum.toString())
      .set('pageSize', pageSize.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (status) params = params.set('status', status);
    return this.http.get<Result<Page<FormulaVO>>>(`${environment.apiBaseUrl}/formula/page`, { params })
      .pipe(map(res => res.data));
  }

  getDetail(id: number): Observable<FormulaDetailVO> {
    return this.http.get<Result<FormulaDetailVO>>(`${environment.apiBaseUrl}/formula/${id}`)
      .pipe(map(res => res.data));
  }

  save(vo: FormulaDetailVO): Observable<boolean> {
    return this.http.post<Result<boolean>>(`${environment.apiBaseUrl}/formula/save`, vo)
      .pipe(map(res => res.data));
  }

  submit(formulaId: number, submitterId: number, remark?: string): Observable<boolean> {
    return this.http.post<Result<boolean>>(`${environment.apiBaseUrl}/formula/submit`, {
      formulaId, submitterId, remark
    }).pipe(map(res => res.data));
  }

  approve(id: number, userId: number, comment?: string): Observable<boolean> {
    return this.http.post<Result<boolean>>(`${environment.apiBaseUrl}/formula/approve`, {
      id, userId, comment
    }).pipe(map(res => res.data));
  }

  reject(id: number, userId: number, rejectReason: string): Observable<boolean> {
    return this.http.post<Result<boolean>>(`${environment.apiBaseUrl}/formula/reject`, {
      id, userId, rejectReason
    }).pipe(map(res => res.data));
  }

  issueProduction(id: number, userId: number): Observable<boolean> {
    return this.http.post<Result<boolean>>(`${environment.apiBaseUrl}/formula/issue/${id}?userId=${userId}`, {})
      .pipe(map(res => res.data));
  }

  validateForbidden(id: number): Observable<void> {
    return this.http.get<Result<void>>(`${environment.apiBaseUrl}/formula/validate/${id}`)
      .pipe(map(() => {}));
  }
}
