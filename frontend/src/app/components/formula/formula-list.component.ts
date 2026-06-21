import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormulaService } from '../../services/formula.service';
import { AuthService } from '../../services/auth.service';
import { FormulaVO, FORMULA_STATUS, User } from '../../models';

@Component({
  selector: 'app-formula-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">染色配方列表</div>
      </div>

      <div class="toolbar">
        <input nz-input [(ngModel)]="keyword" placeholder="搜索配方编号/名称/色号/颜色" style="width:300px;" (keyup.enter)="onSearch()"/>
        <nz-select [(ngModel)]="statusFilter" nzPlaceHolder="状态筛选" style="width:160px;" nzAllowClear (ngModelChange)="onSearch()">
          <nz-option *ngFor="let label of statusLabels" [nzValue]="label.value" [nzLabel]="label.label"></nz-option>
        </nz-select>
        <button nz-button nzType="default" (click)="onSearch()"><i nz-icon nzType="search"></i>查询</button>
        <button nz-button nzType="default" (click)="onReset()"><i nz-icon nzType="reload"></i>重置</button>
        <button *ngIf="isTechnician" nz-button nzType="primary" (click)="onCreate()"><i nz-icon nzType="plus"></i>新建配方</button>
      </div>

      <nz-card>
        <nz-table #table nzBordered [nzData]="dataList" [nzLoading]="loading"
                  [nzTotal]="total" [nzPageSize]="pageSize" [(nzPageIndex)]="pageIndex" (nzPageIndexChange)="onPageChange($event)">
          <thead>
            <tr>
              <th>配方编号</th>
              <th>配方名称</th>
              <th>面料类型</th>
              <th>色号</th>
              <th>颜色</th>
              <th>批量(kg)</th>
              <th>版本</th>
              <th>预估COD(g)</th>
              <th>状态</th>
              <th>创建人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of table.data">
              <td>{{ item.formulaNo }}</td>
              <td>{{ item.formulaName }}</td>
              <td>{{ item.fabricType || '-' }}</td>
              <td>{{ item.colorNo || '-' }}</td>
              <td>{{ item.colorName || '-' }}</td>
              <td>{{ item.batchSize }}</td>
              <td>V{{ item.version }}</td>
              <td>{{ item.estimatedCod }}</td>
              <td>
                <nz-tag [nzColor]="getStatusColor(item.status)">
                  {{ getStatusLabel(item.status) }}
                </nz-tag>
              </td>
              <td>{{ item.creatorName }}</td>
              <td>
                <a (click)="onView(item.id)">查看</a>
                <nz-divider nzType="vertical"></nz-divider>
                <a *ngIf="(item.status==='DRAFT' || item.status==='REJECTED') && isTechnician" (click)="onEdit(item.id)">编辑</a>
                <ng-container *ngIf="item.status==='DRAFT' || item.status==='REJECTED'">
                  <nz-divider nzType="vertical"></nz-divider>
                  <a *ngIf="isTechnician" (click)="onSubmit(item)">提交</a>
                </ng-container>
                <ng-container *ngIf="item.status==='APPROVED'">
                  <nz-divider nzType="vertical"></nz-divider>
                  <a *ngIf="isProductionManager" (click)="onIssue(item.id)">下发生产</a>
                </ng-container>
                <ng-container *ngIf="item.status==='SUBMITTED' || item.status==='SAMPLE'">
                  <nz-divider nzType="vertical"></nz-divider>
                  <a *ngIf="isApprover" (click)="onApprove(item.id)">核准</a>
                  <nz-divider nzType="vertical"></nz-divider>
                  <a *ngIf="isApprover" (click)="onReject(item.id)">驳回</a>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `
})
export class FormulaListComponent implements OnInit {
  keyword = '';
  statusFilter = '';
  dataList: FormulaVO[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;
  currentUser: User | null = null;
  isTechnician = false;
  isApprover = false;
  isProductionManager = false;

  statusLabels: { value: string; label: string }[] = [];

  constructor(
    private formulaService: FormulaService,
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) {
    this.statusLabels = Object.keys(FORMULA_STATUS).map(key => ({
      value: key,
      label: FORMULA_STATUS[key]
    }));
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isTechnician = this.authService.hasRole('TECHNICIAN') || this.authService.hasRole('ADMIN');
    this.isApprover = this.authService.hasRole('ADMIN') || this.authService.hasRole('PRODUCTION_MANAGER');
    this.isProductionManager = this.authService.hasRole('PRODUCTION_MANAGER') || this.authService.hasRole('ADMIN');
    this.loadData();
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      DRAFT: 'default', SUBMITTED: 'blue', SAMPLE: 'orange',
      APPROVED: 'green', PRODUCTION: 'cyan', REJECTED: 'red', OBSOLETE: 'default'
    };
    return colorMap[status] || 'default';
  }

  getStatusLabel(status: string): string {
    return FORMULA_STATUS[status] || status;
  }

  loadData(): void {
    this.loading = true;
    this.formulaService.page(this.pageIndex, this.pageSize, this.keyword || undefined, this.statusFilter || undefined).subscribe({
      next: (res) => {
        this.dataList = res.records;
        this.total = res.total;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  onReset(): void {
    this.keyword = '';
    this.statusFilter = '';
    this.onSearch();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadData();
  }

  onCreate(): void {
    this.router.navigate(['/formula/edit']);
  }

  onView(id: number): void {
    this.router.navigate(['/formula/view', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/formula/edit', id]);
  }

  onSubmit(item: FormulaVO): void {
    this.modal.confirm({
      nzTitle: '确认提交配方',
      nzContent: `确定提交配方「${item.formulaName}」进入审核流程？提交前将自动校验禁限用助剂和库存。`,
      nzOnOk: () => {
        const userId = this.currentUser?.userId || 1;
        this.formulaService.submit(item.id!, userId).subscribe({
          next: () => {
            this.message.success('提交成功');
            this.loadData();
          },
          error: (err) => this.message.error(err.message || '提交失败')
        });
      }
    });
  }

  onApprove(id: number): void {
    this.modal.confirm({
      nzTitle: '核准配方',
      nzContent: '核准后配方将进入可下发状态，是否继续？',
      nzOnOk: () => {
        const userId = this.currentUser?.userId || 1;
        this.formulaService.approve(id, userId).subscribe({
          next: () => {
            this.message.success('核准成功');
            this.loadData();
          },
          error: (err) => this.message.error(err.message || '核准失败')
        });
      }
    });
  }

  onReject(id: number): void {
    const reason = prompt('请输入驳回原因：');
    if (reason && reason.trim()) {
      const userId = this.currentUser?.userId || 1;
      this.formulaService.reject(id, userId, reason).subscribe({
        next: () => {
          this.message.success('已驳回');
          this.loadData();
        },
        error: (err) => this.message.error(err.message || '操作失败')
      });
    } else if (reason !== null) {
      this.message.warning('请输入驳回原因');
    }
  }

  onIssue(id: number): void {
    this.modal.confirm({
      nzTitle: '下发生产',
      nzContent: '下发生产将自动核验废水排放额度、扣减库存并生成排产单，是否继续？',
      nzOnOk: () => {
        const userId = this.currentUser?.userId || 5;
        this.formulaService.issueProduction(id, userId).subscribe({
          next: () => {
            this.message.success('已下发生产');
            this.loadData();
          },
          error: (err) => this.message.error(err.message || '下发失败')
        });
      }
    });
  }
}
