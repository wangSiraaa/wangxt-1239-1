import { Component, OnInit } from '@angular/core';
import { WastewaterService } from '../../services/wastewater.service';
import { ProductionSchedule, FORMULA_STATUS } from '../../models';

@Component({
  selector: 'app-schedule-list',
  template: `
    <div class="page-container">
      <div class="page-header"><div class="page-title">生产排产计划</div></div>
      <div class="toolbar">
        <nz-range-picker [(ngModel)]="dateRange" (ngModelChange)="onSearch()"></nz-range-picker>
        <nz-select [(ngModel)]="statusFilter" style="width:160px;" nzAllowClear nzPlaceHolder="排产状态" (ngModelChange)="onSearch()">
          <nz-option nzValue="SCHEDULED" nzLabel="已排产"></nz-option>
          <nz-option nzValue="DELAYED" nzLabel="已延期"></nz-option>
          <nz-option nzValue="PRODUCING" nzLabel="生产中"></nz-option>
          <nz-option nzValue="COMPLETED" nzLabel="已完成"></nz-option>
          <nz-option nzValue="CANCELLED" nzLabel="已取消"></nz-option>
        </nz-select>
        <button nz-button nzType="default" (click)="onSearch()"><i nz-icon nzType="search"></i>查询</button>
      </div>
      <nz-card>
        <nz-table #table nzBordered [nzData]="dataList" [nzLoading]="loading"
                  [nzTotal]="total" [nzPageSize]="pageSize" [(nzPageIndex)]="pageIndex" (nzPageIndexChange)="onPageChange($event)">
          <thead>
            <tr>
              <th>排产编号</th>
              <th>配方</th>
              <th>计划生产日期</th>
              <th>是否延期</th>
              <th>延期原因</th>
              <th>预计COD(kg)</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of table.data">
              <td>{{ item.scheduleNo }}</td>
              <td>配方#{{ item.formulaId }}</td>
              <td>{{ item.planDate }}</td>
              <td>
                <nz-tag [nzColor]="item.delayedFlag===1 ? 'orange' : 'green'">
                  {{ item.delayedFlag===1 ? '已延期' : '正常' }}
                </nz-tag>
              </td>
              <td>{{ item.delayReason || '-' }}</td>
              <td>{{ item.codLoad }}</td>
              <td>
                <nz-tag [nzColor]="statusColor(item.scheduleStatus)">
                  {{ item.scheduleStatus }}
                </nz-tag>
              </td>
              <td>
                <a *ngIf="item.scheduleStatus==='SCHEDULED'">取消排产</a>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `
})
export class ScheduleListComponent implements OnInit {
  dateRange: any[] = [];
  statusFilter = '';
  dataList: ProductionSchedule[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;
  FORMULA_STATUS = FORMULA_STATUS;

  constructor(private wastewaterService: WastewaterService) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    const start = this.dateRange && this.dateRange[0] ? new Date(this.dateRange[0]).toISOString().split('T')[0] : undefined;
    const end = this.dateRange && this.dateRange[1] ? new Date(this.dateRange[1]).toISOString().split('T')[0] : undefined;
    this.wastewaterService.pageSchedule(this.pageIndex, this.pageSize, this.statusFilter || undefined, start, end).subscribe({
      next: (res) => { this.dataList = res.records; this.total = res.total; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSearch(): void { this.pageIndex = 1; this.loadData(); }
  onPageChange(p: number): void { this.pageIndex = p; this.loadData(); }

  statusColor(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'blue';
      case 'DELAYED': return 'orange';
      case 'PRODUCING': return 'processing';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'default';
      default: return 'blue';
    }
  }
}
