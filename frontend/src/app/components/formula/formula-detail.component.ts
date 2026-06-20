import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormulaService } from '../../services/formula.service';
import { AuxiliaryService } from '../../services/auxiliary.service';
import { SampleService } from '../../services/sample.service';
import { AuthService } from '../../services/auth.service';
import {
  FormulaDetailVO, FormulaDetailItem, FORMULA_STATUS, APPROVAL_NODE,
  Auxiliary, SampleTest, User
} from '../../models';

@Component({
  selector: 'app-formula-detail',
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <button nz-button nzType="text" (click)="onBack()" style="margin-right:8px;">
            <i nz-icon nzType="arrow-left"></i>
          </button>
          {{ isView ? '配方详情' : (formula?.id ? '编辑配方' : '新建配方') }}
        </div>
        <div>
          <button *ngIf="!isView" nz-button nzType="default" (click)="onSave(false)">保存草稿</button>
          <button *ngIf="!isView && isTechnician" nz-button nzType="primary" style="margin-left:8px;" (click)="onSave(true)">保存并提交</button>
        </div>
      </div>

      <nz-card *ngIf="formula" style="margin-bottom:16px;">
        <nz-descriptions nzTitle="基本信息" nzBordered [nzColumn]="3">
          <nz-descriptions-item nzTitle="配方编号">{{ formula.formulaNo || '系统自动生成' }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="版本">V{{ formula.version || 1 }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="状态">
            <span *ngIf="formula.status" [ngClass]="'status-tag status-' + formula.status">
              {{ FORMULA_STATUS[formula.status] || formula.status }}
            </span>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="配方名称">
            <input *ngIf="!isView" nz-input [(ngModel)]="formula.formulaName"/>
            <span *ngIf="isView">{{ formula.formulaName }}</span>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="面料类型">
            <input *ngIf="!isView" nz-input [(ngModel)]="formula.fabricType"/>
            <span *ngIf="isView">{{ formula.fabricType || '-' }}</span>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="批量(kg)">
            <nz-input-number *ngIf="!isView" [(ngModel)]="formula.batchSize" [nzMin]="1"></nz-input-number>
            <span *ngIf="isView">{{ formula.batchSize }}</span>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="色号">
            <input *ngIf="!isView" nz-input [(ngModel)]="formula.colorNo"/>
            <span *ngIf="isView">{{ formula.colorNo || '-' }}</span>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="颜色名称">
            <input *ngIf="!isView" nz-input [(ngModel)]="formula.colorName"/>
            <span *ngIf="isView">{{ formula.colorName || '-' }}</span>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="色差标准ΔE">
            <nz-input-number *ngIf="!isView" [(ngModel)]="formula.colorDiffStandard" [nzMin]="0.1" [nzStep]="0.1"></nz-input-number>
            <span *ngIf="isView">{{ formula.colorDiffStandard }}</span>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="预估COD(g)" nzSpan="3">
            <span style="color:#1677ff;font-weight:600;">{{ formula.estimatedCod || 0 }}</span>
            <span *ngIf="!isView" style="margin-left:8px;color:#8c8c8c;">（根据助剂明细自动计算）</span>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="备注" nzSpan="3">
            <textarea *ngIf="!isView" nz-input [(ngModel)]="formula.remark" rows="2"></textarea>
            <span *ngIf="isView">{{ formula.remark || '-' }}</span>
          </nz-descriptions-item>
        </nz-descriptions>
      </nz-card>

      <nz-card *ngIf="formula" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">助剂明细</h3>
          <button *ngIf="!isView" nz-button nzType="primary" nzSize="small" (click)="onAddDetail()">
            <i nz-icon nzType="plus"></i>添加助剂
          </button>
        </div>
        <nz-table #detailTable nzBordered [nzData]="formula.details || []" [nzShowPagination]="false">
          <thead>
            <tr>
              <th style="width:50px;">#</th>
              <th>助剂</th>
              <th>类型</th>
              <th>用量(kg)</th>
              <th>用量百分比(%)</th>
              <th>工艺阶段</th>
              <th>COD负荷(g/kg)</th>
              <th>小计COD(g)</th>
              <th style="width:100px;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of detailTable.data; let i = index">
              <td>{{ i + 1 }}</td>
              <td>
                <ng-container *ngIf="!isView">
                  <nz-select [(ngModel)]="d.auxiliaryId" style="width:200px;" (ngModelChange)="onAuxChange(d)">
                    <nz-option *ngFor="let a of auxList" [nzValue]="a.id" [nzLabel]="a.auxCode + ' - ' + a.auxName + (a.forbiddenFlag===1?' (禁限用)':'')"></nz-option>
                  </nz-select>
                </ng-container>
                <span *ngIf="isView">
                  {{ d.auxCode }} - {{ d.auxName }}
                  <nz-tag *ngIf="d.forbiddenFlag===1" nzColor="red">禁限用</nz-tag>
                </span>
              </td>
              <td>{{ d.auxType || '-' }}</td>
              <td>
                <nz-input-number *ngIf="!isView" [(ngModel)]="d.dosage" [nzMin]="0" [nzStep]="0.01" (ngModelChange)="calcCod()"></nz-input-number>
                <span *ngIf="isView">{{ d.dosage }}</span>
              </td>
              <td>
                <nz-input-number *ngIf="!isView" [(ngModel)]="d.dosagePercent" [nzMin]="0" [nzStep]="0.01"></nz-input-number>
                <span *ngIf="isView">{{ d.dosagePercent || '-' }}</span>
              </td>
              <td>
                <ng-container *ngIf="!isView">
                  <nz-select [(ngModel)]="d.processStage" style="width:120px;">
                    <nz-option nzValue="前处理" nzLabel="前处理"></nz-option>
                    <nz-option nzValue="染色" nzLabel="染色"></nz-option>
                    <nz-option nzValue="后整理" nzLabel="后整理"></nz-option>
                  </nz-select>
                </ng-container>
                <span *ngIf="isView">{{ d.processStage || '-' }}</span>
              </td>
              <td>{{ d.codPerUnit || 0 }}</td>
              <td style="color:#1677ff;font-weight:600;">{{ getSubTotal(d) }}</td>
              <td>
                <a *ngIf="!isView" (click)="onRemoveDetail(i)">删除</a>
              </td>
            </tr>
            <tr *ngIf="!formula.details || formula.details.length===0">
              <td colspan="9" style="text-align:center;color:#8c8c8c;">暂无数据，请点击"添加助剂"</td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>

      <nz-card *ngIf="formula && formula.sampleTests && formula.sampleTests.length > 0" style="margin-bottom:16px;">
        <h3 style="margin:0 0 16px;">小样测试记录</h3>
        <nz-table #sampleTable nzBordered [nzData]="formula.sampleTests" [nzShowPagination]="false">
          <thead>
            <tr>
              <th>测试编号</th>
              <th>测试批次</th>
              <th>测试日期</th>
              <th>测试人</th>
              <th>总色差ΔE</th>
              <th>是否达标</th>
              <th>测试结论</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of sampleTable.data">
              <td>{{ s.testNo }}</td>
              <td>{{ s.sampleBatch || '-' }}</td>
              <td>{{ s.testDate }}</td>
              <td>{{ s.testerName }}</td>
              <td style="font-weight:600;color:{{ s.colorPassFlag===1 ? '#52c41a' : '#ff4d4f' }}">{{ s.colorDiffDe }}</td>
              <td>
                <nz-tag [nzColor]="s.colorPassFlag===1 ? 'green' : 'red'">
                  {{ s.colorPassFlag===1 ? '达标' : '不达标' }}
                </nz-tag>
              </td>
              <td>{{ s.testConclusion }}</td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>

      <nz-card *ngIf="isView && formula?.id && isLabTester" style="margin-bottom:16px;">
        <h3 style="margin:0 0 16px;">录入小样测试结果</h3>
        <div nz-row [nzGutter]="16">
          <div nz-col nzSpan="8">
            <label style="display:block;margin-bottom:4px;">小样批次号</label>
            <input nz-input [(ngModel)]="testDto.sampleBatch"/>
          </div>
          <div nz-col nzSpan="8">
            <label style="display:block;margin-bottom:4px;">测试日期</label>
            <nz-date-picker [(ngModel)]="testDate" style="width:100%;"></nz-date-picker>
          </div>
        </div>
        <nz-divider></nz-divider>
        <div style="margin-bottom:12px;font-weight:600;">实验室测量值（L*a*b*）：</div>
        <div nz-row [nzGutter]="16">
          <div nz-col nzSpan="8">
            <label>L*</label>
            <nz-input-number [(ngModel)]="testDto.labColorL" style="width:100%;"></nz-input-number>
          </div>
          <div nz-col nzSpan="8">
            <label>a*</label>
            <nz-input-number [(ngModel)]="testDto.labColorA" style="width:100%;"></nz-input-number>
          </div>
          <div nz-col nzSpan="8">
            <label>b*</label>
            <nz-input-number [(ngModel)]="testDto.labColorB" style="width:100%;"></nz-input-number>
          </div>
        </div>
        <div style="margin:16px 0 12px;font-weight:600;">标准样（L*a*b*）：</div>
        <div nz-row [nzGutter]="16">
          <div nz-col nzSpan="8">
            <label>L*</label>
            <nz-input-number [(ngModel)]="testDto.stdColorL" style="width:100%;"></nz-input-number>
          </div>
          <div nz-col nzSpan="8">
            <label>a*</label>
            <nz-input-number [(ngModel)]="testDto.stdColorA" style="width:100%;"></nz-input-number>
          </div>
          <div nz-col nzSpan="8">
            <label>b*</label>
            <nz-input-number [(ngModel)]="testDto.stdColorB" style="width:100%;"></nz-input-number>
          </div>
        </div>
        <nz-divider></nz-divider>
        <div nz-row [nzGutter]="16">
          <div nz-col nzSpan="8">
            <label>摩擦牢度</label>
            <input nz-input [(ngModel)]="testDto.rubbingFastness"/>
          </div>
          <div nz-col nzSpan="8">
            <label>水洗牢度</label>
            <input nz-input [(ngModel)]="testDto.washingFastness"/>
          </div>
          <div nz-col nzSpan="8">
            <label>日晒牢度</label>
            <input nz-input [(ngModel)]="testDto.lightFastness"/>
          </div>
        </div>
        <div style="margin-top:16px;">
          <label>测试报告/说明</label>
          <textarea nz-input [(ngModel)]="testDto.testReport" rows="2"></textarea>
        </div>
        <div style="margin-top:16px;">
          <button nz-button nzType="default" (click)="calcColorDiff()">计算色差ΔE</button>
          <span *ngIf="calculatedDe !== null" style="margin-left:16px;">
            总色差 ΔE = <strong style="font-size:18px;color:{{isPass?'#52c41a':'#ff4d4f'}}">{{ calculatedDe }}</strong>
            （标准≤{{ formula?.colorDiffStandard || 1.0 }}，{{ isPass ? '达标' : '不达标' }}）
          </span>
          <button nz-button nzType="primary" style="margin-left:16px;" (click)="onSubmitTest()">提交测试结果</button>
        </div>
      </nz-card>

      <nz-card *ngIf="isView && formula?.approvalLogs && formula.approvalLogs.length > 0">
        <h3 style="margin:0 0 16px;">审批流程</h3>
        <nz-timeline>
          <nz-timeline-item *ngFor="let log of formula.approvalLogs"
            [nzColor]="log.operation==='PASS' ? 'green' : (log.operation==='REJECT' ? 'red' : 'blue')">
            <div style="font-weight:600;">
              {{ log.approvalNodeName }} - {{ log.operation==='SUBMIT' ? '提交' : (log.operation==='PASS' ? '通过' : '驳回') }}
            </div>
            <div style="color:#8c8c8c;font-size:12px;">
              {{ log.operatorName }} · {{ log.operationTime }}
            </div>
            <div *ngIf="log.comment" style="margin-top:4px;">{{ log.comment }}</div>
          </nz-timeline-item>
        </nz-timeline>
      </nz-card>
    </div>
  `
})
export class FormulaDetailComponent implements OnInit {
  id: number | null = null;
  isView = false;
  formula: FormulaDetailVO | null = null;
  auxList: Auxiliary[] = [];
  currentUser: User | null = null;
  isTechnician = false;
  isLabTester = false;
  isApprover = false;
  FORMULA_STATUS = FORMULA_STATUS;
  APPROVAL_NODE = APPROVAL_NODE;

  testDto: any = {
    sampleBatch: '',
    labColorL: null, labColorA: null, labColorB: null,
    stdColorL: null, stdColorA: null, stdColorB: null,
    rubbingFastness: '', washingFastness: '', lightFastness: '',
    testReport: ''
  };
  testDate: Date | null = null;
  calculatedDe: number | null = null;
  isPass = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formulaService: FormulaService,
    private auxiliaryService: AuxiliaryService,
    private sampleService: SampleService,
    private authService: AuthService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isTechnician = this.authService.hasRole('TECHNICIAN') || this.authService.hasRole('ADMIN');
    this.isLabTester = this.authService.hasRole('LAB_TESTER') || this.authService.hasRole('ADMIN');
    this.isApprover = this.authService.hasRole('ADMIN') || this.authService.hasRole('PRODUCTION_MANAGER');

    this.route.url.subscribe(segments => {
      this.isView = segments.some(s => s.path === 'view');
    });
    this.route.params.subscribe(params => {
      this.id = params['id'] ? +params['id'] : null;
      if (this.id) {
        this.loadDetail();
      } else {
        this.formula = {
          formulaName: '',
          fabricType: '',
          colorNo: '',
          colorName: '',
          batchSize: 100,
          colorDiffStandard: 1.0,
          creatorId: this.currentUser?.userId,
          details: []
        };
      }
    });
    this.loadAuxList();
  }

  loadDetail(): void {
    if (!this.id) return;
    this.formulaService.getDetail(this.id).subscribe({
      next: (res) => {
        this.formula = res;
        if (!this.formula.details) this.formula.details = [];
        if (this.isView && !this.isTechnician) {
        }
      },
      error: (err) => this.message.error(err.message || '加载失败')
    });
  }

  loadAuxList(): void {
    this.auxiliaryService.listAvailable().subscribe({
      next: (res) => {
        this.auxList = res;
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/formula']);
  }

  onAddDetail(): void {
    if (!this.formula) return;
    if (!this.formula.details) this.formula.details = [];
    this.formula.details.push({
      auxiliaryId: 0,
      dosage: 0,
      dosageUnit: 'kg',
      dosagePercent: 0,
      processStep: this.formula.details.length + 1,
      processStage: '染色'
    });
  }

  onRemoveDetail(index: number): void {
    if (!this.formula?.details) return;
    this.formula.details.splice(index, 1);
    this.calcCod();
  }

  onAuxChange(d: FormulaDetailItem): void {
    const aux = this.auxList.find(a => a.id === d.auxiliaryId);
    if (aux) {
      d.auxCode = aux.auxCode;
      d.auxName = aux.auxName;
      d.auxType = aux.auxType;
      d.forbiddenFlag = aux.forbiddenFlag;
      d.codPerUnit = aux.codPerUnit;
      if (aux.forbiddenFlag === 1) {
        this.message.warning(`助剂「${aux.auxName}」为禁限用助剂，提交时将被系统拦截！`);
      }
    }
    this.calcCod();
  }

  calcCod(): void {
    if (!this.formula?.details) return;
    let total = 0;
    for (const d of this.formula.details) {
      if (d.dosage && d.codPerUnit) {
        total += d.dosage * d.codPerUnit;
      }
    }
    this.formula.estimatedCod = Number(total.toFixed(4));
  }

  getSubTotal(d: FormulaDetailItem): number {
    return Number(((d.dosage || 0) * (d.codPerUnit || 0)).toFixed(4));
  }

  onSave(andSubmit: boolean): void {
    if (!this.formula) return;
    if (!this.formula.formulaName) {
      this.message.error('请输入配方名称');
      return;
    }
    if (!this.formula.details || this.formula.details.length === 0) {
      this.message.error('请至少添加一种助剂');
      return;
    }
    for (const d of this.formula.details) {
      if (!d.auxiliaryId) {
        this.message.error('请选择助剂');
        return;
      }
      if (!d.dosage || d.dosage <= 0) {
        this.message.error('请填写有效助剂用量');
        return;
      }
    }
    this.formulaService.save(this.formula).subscribe({
      next: () => {
        this.message.success(andSubmit ? '保存成功' : '草稿已保存');
        if (andSubmit) {
          this.onSubmitAfterSave();
        } else {
          this.router.navigate(['/formula']);
        }
      },
      error: (err) => this.message.error(err.message || '保存失败')
    });
  }

  onSubmitAfterSave(): void {
    if (!this.formula) return;
    this.modal.confirm({
      nzTitle: '提交配方',
      nzContent: '确认提交该配方进入审核流程？系统将自动校验禁限用助剂和库存。',
      nzOnOk: () => {
        const userId = this.currentUser?.userId || 1;
        this.formulaService.submit(this.formula!.id!, userId, this.formula!.remark).subscribe({
          next: () => {
            this.message.success('提交成功');
            this.router.navigate(['/formula']);
          },
          error: (err) => this.message.error(err.message || '提交失败')
        });
      }
    });
  }

  calcColorDiff(): void {
    const t = this.testDto;
    if ([t.labColorL, t.labColorA, t.labColorB, t.stdColorL, t.stdColorA, t.stdColorB].some((v: any) => v === null || v === undefined)) {
      this.message.warning('请先填写完整的L*a*b*值');
      return;
    }
    this.sampleService.calculateColorDiff(t.labColorL, t.labColorA, t.labColorB, t.stdColorL, t.stdColorA, t.stdColorB).subscribe({
      next: (de) => {
        this.calculatedDe = de;
        this.isPass = de <= (this.formula?.colorDiffStandard || 1.0);
      }
    });
  }

  onSubmitTest(): void {
    if (!this.id || !this.formula) return;
    const t = this.testDto;
    if (!t.labColorL || !t.stdColorL) {
      this.message.error('请填写L*a*b*测量值');
      return;
    }
    const submitData: any = {
      ...t,
      formulaId: this.id,
      testerId: this.currentUser?.userId || 2,
      testDate: this.testDate ? new Date(this.testDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };
    this.sampleService.submitTest(submitData).subscribe({
      next: () => {
        this.message.success('测试结果已提交');
        this.loadDetail();
      },
      error: (err) => this.message.error(err.message || '提交失败')
    });
  }
}
