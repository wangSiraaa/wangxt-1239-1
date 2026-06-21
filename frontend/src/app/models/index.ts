export interface User {
  userId: number;
  username: string;
  realName: string;
  roleId: number;
  roleCode: string;
  roleName: string;
  phone?: string;
  token?: string;
}

export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

export interface Page<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface SysRole {
  id: number;
  roleCode: string;
  roleName: string;
  description?: string;
}

export interface Auxiliary {
  id?: number;
  auxCode: string;
  auxName: string;
  auxType?: string;
  casNo?: string;
  unit: string;
  forbiddenFlag: number;
  forbiddenReason?: string;
  codPerUnit: number;
  description?: string;
  createTime?: string;
  updateTime?: string;
}

export interface AuxiliaryStock {
  id?: number;
  auxiliaryId: number;
  warehouse: string;
  batchNo?: string;
  quantity: number;
  safetyStock: number;
  expireDate?: string;
  auxiliary?: Auxiliary;
}

export interface DyeingFormula {
  id?: number;
  formulaNo?: string;
  formulaName: string;
  fabricType?: string;
  colorNo?: string;
  colorName?: string;
  batchSize: number;
  version?: number;
  parentId?: number;
  status?: string;
  statusName?: string;
  colorDiffStandard: number;
  estimatedCod?: number;
  creatorId?: number;
  creatorName?: string;
  submitTime?: string;
  approverId?: number;
  approverName?: string;
  approveTime?: string;
  productionTime?: string;
  rejectReason?: string;
  remark?: string;
  createTime?: string;
}

export type FormulaVO = DyeingFormula;

export interface FormulaDetailVO extends DyeingFormula {
  details?: FormulaDetailItem[];
  sampleTests?: SampleTestVO[];
  approvalLogs?: ApprovalLogVO[];
}

export interface FormulaDetailItem {
  id?: number;
  auxiliaryId: number;
  auxCode?: string;
  auxName?: string;
  auxType?: string;
  forbiddenFlag?: number;
  dosage: number;
  dosageUnit: string;
  dosagePercent?: number;
  processStep?: number;
  processStage?: string;
  codPerUnit?: number;
}

export interface SampleTestVO {
  id: number;
  testNo: string;
  sampleBatch?: string;
  testDate?: string;
  testerName?: string;
  colorDiffDe?: number;
  colorPassFlag?: number;
  testConclusion?: string;
}

export interface ApprovalLogVO {
  id: number;
  approvalNode: string;
  approvalNodeName?: string;
  operatorName?: string;
  operation: string;
  operationTime?: string;
  comment?: string;
}

export interface SampleTest {
  id?: number;
  testNo?: string;
  formulaId: number;
  sampleBatch?: string;
  testDate: string;
  testerId?: number;
  labColorL?: number;
  labColorA?: number;
  labColorB?: number;
  stdColorL?: number;
  stdColorA?: number;
  stdColorB?: number;
  colorDiffDe?: number;
  colorDiffDl?: number;
  colorDiffDa?: number;
  colorDiffDb?: number;
  colorPassFlag?: number;
  rubbingFastness?: string;
  washingFastness?: string;
  lightFastness?: string;
  testConclusion?: string;
  testReport?: string;
}

export interface WastewaterDailyQuota {
  id?: number;
  quotaDate: string;
  totalCodQuota: number;
  usedCodQuota: number;
  remainingCodQuota: number;
  totalWaterQuota?: number;
  usedWaterQuota: number;
  status?: string;
}

export interface WastewaterLog {
  id?: number;
  logNo: string;
  formulaId?: number;
  productionDate: string;
  estimatedCod: number;
  actualCod?: number;
  estimatedWater?: number;
  actualWater?: number;
  checkerId?: number;
  checkTime?: string;
  checkStatus: string;
  remark?: string;
}

export interface ProductionSchedule {
  id?: number;
  scheduleNo: string;
  formulaId: number;
  planDate: string;
  scheduleStatus: string;
  delayedFlag?: number;
  delayReason?: string;
  delayToDate?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  machineNo?: string;
  operatorId?: number;
  codLoad?: number;
}

export const FORMULA_STATUS: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  SAMPLE: '小样测试中',
  APPROVED: '已核准',
  PRODUCTION: '已下发生产',
  REJECTED: '已驳回',
  OBSOLETE: '已作废'
};

export const APPROVAL_NODE: Record<string, string> = {
  SUBMIT: '提交',
  SAMPLE: '小样测试',
  COLOR: '色差审核',
  STOCK: '库存核验',
  ENV: '环保核对',
  APPROVE: '最终核准'
};
