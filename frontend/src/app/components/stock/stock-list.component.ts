import { Component, OnInit } from '@angular/core';
import { WastewaterService } from '../../services/wastewater.service';
import { AuxiliaryService } from '../../services/auxiliary.service';
import { AuxiliaryStock, Auxiliary } from '../../models';

@Component({
  selector: 'app-stock-list',
  template: `
    <div class="page-container">
      <div class="page-header"><div class="page-title">助剂库存管理</div></div>
      <div class="toolbar">
        <nz-select [(ngModel)]="auxFilter" style="width:240px;" nzPlaceHolder="选择助剂" nzAllowClear (ngModelChange)="onSearch()">
          <nz-option *ngFor="let a of auxList" [nzValue]="a.id" [nzLabel]="a.auxCode + ' - ' + a.auxName"></nz-option>
        </nz-select>
        <button nz-button nzType="default" (click)="onSearch()"><i nz-icon nzType="search"></i>查询</button>
      </div>
      <nz-card>
        <nz-table #table nzBordered [nzData]="dataList" [nzLoading]="loading"
                  [nzTotal]="total" [nzPageSize]="pageSize" [(nzPageIndex)]="pageIndex" (nzPageIndexChange)="onPageChange($event)">
          <thead>
            <tr>
              <th>助剂编码</th>
              <th>助剂名称</th>
              <th>仓库</th>
              <th>批次号</th>
              <th>库存数量</th>
              <th>安全库存</th>
              <th>有效期</th>
              <th>库存状态</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of table.data">
              <td>{{ getAux(item.auxiliaryId)?.auxCode || '-' }}</td>
              <td>{{ getAux(item.auxiliaryId)?.auxName || '-' }}</td>
              <td>{{ item.warehouse }}</td>
              <td>{{ item.batchNo || '-' }}</td>
              <td [style.color]="item.quantity < item.safetyStock ? '#ff4d4f' : '#1f1f1f'">
                {{ item.quantity }} {{ getAux(item.auxiliaryId)?.unit || 'kg' }}
              </td>
              <td>{{ item.safetyStock }}</td>
              <td>{{ item.expireDate || '-' }}</td>
              <td>
                <nz-tag [nzColor]="item.quantity < item.safetyStock ? 'red' : 'green'">
                  {{ item.quantity < item.safetyStock ? '低于安全库存' : '正常' }}
                </nz-tag>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `
})
export class StockListComponent implements OnInit {
  auxFilter: number | null = null;
  dataList: AuxiliaryStock[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;
  auxList: Auxiliary[] = [];
  auxMap: Record<number, Auxiliary> = {};

  constructor(private wastewaterService: WastewaterService, private auxiliaryService: AuxiliaryService) {}

  ngOnInit(): void {
    this.auxiliaryService.listAvailable().subscribe(res => {
      this.auxList = res;
      this.auxMap = {};
      res.forEach(a => this.auxMap[a.id!] = a);
    });
    this.loadData();
  }

  getAux(id: number): Auxiliary | undefined { return this.auxMap[id]; }

  loadData(): void {
    this.loading = true;
    this.wastewaterService.pageStock(this.pageIndex, this.pageSize, this.auxFilter || undefined).subscribe({
      next: (res) => { this.dataList = res.records; this.total = res.total; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSearch(): void { this.pageIndex = 1; this.loadData(); }
  onPageChange(p: number): void { this.pageIndex = p; this.loadData(); }
}
