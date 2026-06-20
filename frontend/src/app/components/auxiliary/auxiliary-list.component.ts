import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuxiliaryService } from '../../services/auxiliary.service';
import { AuthService } from '../../services/auth.service';
import { Auxiliary } from '../../models';

@Component({
  selector: 'app-auxiliary-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">助剂档案管理</div>
        <button *ngIf="isAdmin" nz-button nzType="primary" (click)="onCreate()"><i nz-icon nzType="plus"></i>新增助剂</button>
      </div>
      <div class="toolbar">
        <input nz-input [(ngModel)]="keyword" placeholder="搜索编码/名称" style="width:240px;" (keyup.enter)="onSearch()"/>
        <nz-select [(ngModel)]="forbiddenFilter" style="width:140px;" nzAllowClear (ngModelChange)="onSearch()">
          <nz-option nzValue="0" nzLabel="正常助剂"></nz-option>
          <nz-option nzValue="1" nzLabel="禁限用助剂"></nz-option>
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
              <th>类型</th>
              <th>CAS号</th>
              <th>计量单位</th>
              <th>COD负荷(g/kg)</th>
              <th>状态</th>
              <th>禁限用原因</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of table.data">
              <td>{{ item.auxCode }}</td>
              <td>{{ item.auxName }}</td>
              <td>{{ item.auxType || '-' }}</td>
              <td>{{ item.casNo || '-' }}</td>
              <td>{{ item.unit }}</td>
              <td>{{ item.codPerUnit }}</td>
              <td>
                <nz-tag [nzColor]="item.forbiddenFlag===1 ? 'red' : 'green'">
                  {{ item.forbiddenFlag===1 ? '禁限用' : '正常' }}
                </nz-tag>
              </td>
              <td>{{ item.forbiddenReason || '-' }}</td>
              <td>
                <a *ngIf="isAdmin" (click)="onEdit(item)">编辑</a>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `
})
export class AuxiliaryListComponent implements OnInit {
  keyword = '';
  forbiddenFilter = '';
  dataList: Auxiliary[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;
  isAdmin = false;
  editItem: Auxiliary | null = null;

  constructor(
    private auxiliaryService: AuxiliaryService,
    private authService: AuthService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ADMIN') || this.authService.hasRole('WAREHOUSE_KEEPER');
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const forbidden = this.forbiddenFilter === '' ? undefined : Number(this.forbiddenFilter);
    this.auxiliaryService.page(this.pageIndex, this.pageSize, this.keyword || undefined, forbidden).subscribe({
      next: (res) => {
        this.dataList = res.records;
        this.total = res.total;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearch(): void { this.pageIndex = 1; this.loadData(); }
  onPageChange(p: number): void { this.pageIndex = p; this.loadData(); }

  onCreate(): void {
    this.editItem = {
      auxCode: '', auxName: '', auxType: '', unit: 'kg',
      forbiddenFlag: 0, codPerUnit: 0, description: ''
    };
    this.openEditModal();
  }

  onEdit(item: Auxiliary): void {
    this.editItem = { ...item };
    this.openEditModal();
  }

  openEditModal(): void {
    this.modal.create({
      nzTitle: this.editItem?.id ? '编辑助剂' : '新增助剂',
      nzContent: `
        <div nz-form>
          <nz-form-item><nz-form-label>助剂编码 *</nz-form-label>
            <nz-form-control><input nz-input [(ngModel)]="editItem.auxCode"/></nz-form-control></nz-form-item>
          <nz-form-item><nz-form-label>助剂名称 *</nz-form-label>
            <nz-form-control><input nz-input [(ngModel)]="editItem.auxName"/></nz-form-control></nz-form-item>
          <nz-form-item><nz-form-label>类型</nz-form-label>
            <nz-form-control>
              <nz-select [(ngModel)]="editItem.auxType" style="width:100%;" nzAllowClear>
                <nz-option nzValue="活性染料" nzLabel="活性染料"></nz-option>
                <nz-option nzValue="分散染料" nzLabel="分散染料"></nz-option>
                <nz-option nzValue="匀染剂" nzLabel="匀染剂"></nz-option>
                <nz-option nzValue="固色剂" nzLabel="固色剂"></nz-option>
                <nz-option nzValue="渗透剂" nzLabel="渗透剂"></nz-option>
                <nz-option nzValue="碱剂" nzLabel="碱剂"></nz-option>
                <nz-option nzValue="促染剂" nzLabel="促染剂"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item><nz-form-label>CAS号</nz-form-label>
            <nz-form-control><input nz-input [(ngModel)]="editItem.casNo"/></nz-form-control></nz-form-item>
          <nz-form-item><nz-form-label>计量单位</nz-form-label>
            <nz-form-control><input nz-input [(ngModel)]="editItem.unit"/></nz-form-control></nz-form-item>
          <nz-form-item><nz-form-label>COD负荷(g/kg)</nz-form-label>
            <nz-form-control><nz-input-number [(ngModel)]="editItem.codPerUnit" style="width:100%;"/></nz-form-control></nz-form-item>
          <nz-form-item><nz-form-label>状态</nz-form-label>
            <nz-form-control>
              <nz-select [(ngModel)]="editItem.forbiddenFlag" style="width:100%;">
                <nz-option [nzValue]="0" nzLabel="正常"></nz-option>
                <nz-option [nzValue]="1" nzLabel="禁限用"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item *ngIf="editItem?.forbiddenFlag===1"><nz-form-label>禁限用原因</nz-form-label>
            <nz-form-control><textarea nz-input [(ngModel)]="editItem.forbiddenReason" rows="2"></textarea></nz-form-control></nz-form-item>
        </div>
      `,
      nzComponentParams: { editItem: this.editItem },
      nzFooter: [
        { label: '取消', onClick: () => {} },
        {
          label: '保存',
          type: 'primary',
          onClick: () => {
            if (!this.editItem?.auxCode || !this.editItem?.auxName) {
              this.message.error('请填写助剂编码和名称');
              return;
            }
            this.auxiliaryService.save(this.editItem!).subscribe({
              next: () => {
                this.message.success('保存成功');
                this.modal.closeAll();
                this.loadData();
              },
              error: (e) => this.message.error(e.message || '保存失败')
            });
          }
        }
      ]
    });
  }
}
