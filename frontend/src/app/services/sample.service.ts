import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Result, Page, SampleTest } from '../models';

@Injectable({ providedIn: 'root' })
export class SampleService {

  constructor(private http: HttpClient) {}

  page(pageNum: number = 1, pageSize: number = 10, formulaId?: number, conclusion?: string): Observable<Page<SampleTest>> {
    let params = new HttpParams()
      .set('pageNum', pageNum.toString())
      .set('pageSize', pageSize.toString());
    if (formulaId) params = params.set('formulaId', formulaId.toString());
    if (conclusion) params = params.set('conclusion', conclusion);
    return this.http.get<Result<Page<SampleTest>>>(`${environment.apiBaseUrl}/sample/page`, { params })
      .pipe(map(res => res.data));
  }

  getByFormulaId(formulaId: number): Observable<SampleTest> {
    return this.http.get<Result<SampleTest>>(`${environment.apiBaseUrl}/sample/formula/${formulaId}`)
      .pipe(map(res => res.data));
  }

  submitTest(dto: any): Observable<boolean> {
    return this.http.post<Result<boolean>>(`${environment.apiBaseUrl}/sample/submit`, dto)
      .pipe(map(res => res.data));
  }

  calculateColorDiff(l1: number, a1: number, b1: number, l2: number, a2: number, b2: number): Observable<number> {
    const params = new HttpParams()
      .set('l1', l1.toString()).set('a1', a1.toString()).set('b1', b1.toString())
      .set('l2', l2.toString()).set('a2', a2.toString()).set('b2', b2.toString());
    return this.http.get<Result<number>>(`${environment.apiBaseUrl}/sample/calculate`, { params })
      .pipe(map(res => res.data));
  }
}
