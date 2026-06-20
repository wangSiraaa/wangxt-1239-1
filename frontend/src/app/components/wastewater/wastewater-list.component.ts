import { Component, OnInit } from '@angular/core';
import { WastewaterService } from '../../services/wastewater.service';
import { WastewaterDailyQuota } from '../../models';

@Component({
  selector: 'app-wastewater-list',
  template: `
    <div class="page-container">
      <div class="page-header"><div class="page-title">废水排放额度管理</div></div>

      <div class="toolbar" style="margin-bottom:24px;">
        <div class="stat-card" style="flex:1;min-width:220px;">
          <div class="stat-label">今日COD总许可量</div>
          <div class="stat-value" *ngIf="todayQuota">{{ todayQuota.totalCodQuota }} <span style="font-size:14px;color:#8c8c8c;">kg</span></div>
          <div class="stat-value" *ngIf="!todayQuota">-</div>
        </div>
        <div class="stat-card" style="flex:1;min-width:220px;">
          <div class="stat-label">今日已使用</div>
          <div class="stat-value" style="color:#fa8c16;" *ngIf="todayQuota">{{ todayQuota.usedCodQuota }} <span style="font-size:14px;">kg</span></div>
          <div class="stat-value" *ngIf="!todayQuota">-</div>
        </div>
        <div class="stat-card" style="flex:1;min-width:220px;">
          <div class="stat-label">今日剩余可用</div>
          <div class="stat-value" style="color:#52c41a;" *ngIf="todayQuota">{{ todayQuota.remainingCodQuota }} <span style="font-size:14px;">kg</span></div>
          <div class="stat-value" *ngIf="!todayQuota">-</div>
        </div>
        <div class="stat-card" style="flex:1;min-width:220px;">
          <div class="stat-label">今日用水量许可</div>
          <div class="stat-value" *ngIf="todayQuota">{{ todayQuota.totalWaterQuota }} <span style="font-size:14px;color:#8c8c8c;">吨</span></div>
          <div class="stat-value" *ngIf="!todayQuota">-</div>
        </div>
      </div>

      <nz-card>
        <nz-table #table nzBordered [nzData]="dataList" [nzLoading]="loading"
                  [nzTotal]="total" [nzPageSize]="pageSize" [(nzPageIndex)]="pageIndex" (nzPageIndexChange)="onPageChange($event)">
          <thead>
            <tr>
              <th>日期</th>
              <th>COD总许可(kg)</th>
              <th>已使用(kg)</th>
              <th>剩余(kg)</th>
              <th>使用率</th>
              <th>总水量许可(吨)</th>
              <th>已用水量(吨)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of table.data">
              <td>{{ item.quotaDate }}</td>
              <td>{{ item.totalCodQuota }}</td>
              <td [style.color]="item.usedCodQuota > item.totalCodQuota*0.9 ? '#ff4d4f' : '#1f1f1f'">{{ item.usedCodQuota }}</td>
              <td>{{ item.remainingCodQuota }}</td>
              <td>
                <nz-progress [nzPercent]="getPercent(item.usedCodQuota, item.totalCodQuota)"
                             [nzStatus]="getStatus(item.usedCodQuota, item.totalCodQuota)"
                             nzStrokeColor="#1677ff"></nz-progress>
              </td>
              <td>{{ item.totalWaterQuota || '-' }}</td>
              <td>{{ item.usedWaterQuota || '-' }}</td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `
})
export class WastewaterListComponent implements OnInit {
  dataList: WastewaterDailyQuota[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;
  todayQuota: WastewaterDailyQuota | null = null;

  constructor(private wastewaterService: WastewaterService) {}

  ngOnInit(): void {
    this.loadToday();
    this.loadData();
  }

  loadToday(): void {
    this.wastewaterService.getTodayQuota().subscribe({
      next: (res) => this.todayQuota = res
    });
  }

  loadData(): void {
    this.loading = true;
    this.wastewaterService.pageQuota(this.pageIndex, this.pageSize).subscribe({
      next: (res) => { this.dataList = res.records; this.total = res.total; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onPageChange(p: number): void { this.pageIndex = p; this.loadData(); }

  getPercent(used: number, total: number): number {
    if (!total) return 0;
    return Math.min(100, Math.round(used / total * 100));
  }

  getStatus(used: number, total: number): string {
    if (!total) return 'normal';
    const pct = used / total;
    if (pct >= 0.95) return 'exception';
    if (pct >= 0.8) return 'active';
    return 'normal';
  }
}
