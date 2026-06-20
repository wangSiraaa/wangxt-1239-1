import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SampleService } from '../../services/sample.service';
import { FormulaService } from '../../services/formula.service';
import { SampleTest, FormulaVO } from '../../models';

@Component({
  selector: 'app-sample-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">小样测试记录</div>
      </div>
      <div class="toolbar">
        <nz-select [(ngModel)]="conclusionFilter" nzPlaceHolder="测试结论" style="width:160px;" nzAllowClear (ngModelChange)="onSearch()">
          <nz-option nzValue="PASS" nzLabel="合格"></nz-option>
          <nz-option nzValue="FAIL" nzLabel="不合格"></nz-option>
          <nz-option nzValue="RETEST" nzLabel="复测"></nz-option>
        </nz-select>
        <button nz-button nzType="default" (click)="onSearch()"><i nz-icon nzType="search"></i>查询</button>
      </div>
      <nz-card>
        <nz-table #table nzBordered [nzData]="dataList" [nzLoading]="loading"
                  [nzTotal]="total" [nzPageSize]="pageSize" [(nzPageIndex)]="pageIndex" (nzPageIndexChange)="onPageChange($event)">
          <thead>
            <tr>
              <th>测试编号</th>
              <th>小样批次</th>
              <th>配方</th>
              <th>测试日期</th>
              <th>总色差ΔE</th>
              <th>是否达标</th>
              <th>摩擦牢度</th>
              <th>水洗牢度</th>
              <th>日晒牢度</th>
              <th>测试结论</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of table.data">
              <td>{{ item.testNo }}</td>
              <td>{{ item.sampleBatch || '-' }}</td>
              <td>配方#{{ item.formulaId }}</td>
              <td>{{ item.testDate }}</td>
              <td style="font-weight:600;color:{{ item.colorPassFlag===1 ? '#52c41a' : '#ff4d4f' }}">{{ item.colorDiffDe || '-' }}</td>
              <td>
                <nz-tag [nzColor]="item.colorPassFlag===1 ? 'green' : 'red'">
                  {{ item.colorPassFlag===1 ? '达标' : '不达标' }}
                </nz-tag>
              </td>
              <td>{{ item.rubbingFastness || '-' }}</td>
              <td>{{ item.washingFastness || '-' }}</td>
              <td>{{ item.lightFastness || '-' }}</td>
              <td>
                <nz-tag [nzColor]="item.testConclusion==='PASS'?'green':(item.testConclusion==='FAIL'?'red':'orange')">
                  {{ item.testConclusion }}
                </nz-tag>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `
})
export class SampleListComponent implements OnInit {
  conclusionFilter = '';
  dataList: SampleTest[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;
  formulaMap: Record<number, FormulaVO> = {};

  constructor(private sampleService: SampleService, private formulaService: FormulaService, private message: NzMessageService) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    this.sampleService.page(this.pageIndex, this.pageSize, undefined, this.conclusionFilter || undefined).subscribe({
      next: (res) => { this.dataList = res.records; this.total = res.total; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSearch(): void { this.pageIndex = 1; this.loadData(); }
  onPageChange(p: number): void { this.pageIndex = p; this.loadData(); }
}
