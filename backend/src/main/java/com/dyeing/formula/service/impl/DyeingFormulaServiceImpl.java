package com.dyeing.formula.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dyeing.formula.dto.FormulaSubmitDTO;
import com.dyeing.formula.entity.*;
import com.dyeing.formula.exception.BusinessException;
import com.dyeing.formula.mapper.*;
import com.dyeing.formula.service.*;
import com.dyeing.formula.vo.FormulaDetailVO;
import com.dyeing.formula.vo.FormulaVO;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DyeingFormulaServiceImpl extends ServiceImpl<DyeingFormulaMapper, DyeingFormula> implements DyeingFormulaService {

    @Autowired
    private DyeingFormulaDetailMapper formulaDetailMapper;

    @Autowired
    private AuxiliaryMapper auxiliaryMapper;

    @Autowired
    private AuxiliaryStockMapper auxiliaryStockMapper;

    @Autowired
    private AuxiliaryStockService auxiliaryStockService;

    @Autowired
    private SampleTestService sampleTestService;

    @Autowired
    private WastewaterService wastewaterService;

    @Autowired
    private ProductionScheduleService productionScheduleService;

    @Autowired
    private FormulaApprovalLogMapper approvalLogMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    private static final Map<String, String> STATUS_MAP = new HashMap<>();
    static {
        STATUS_MAP.put("DRAFT", "草稿");
        STATUS_MAP.put("SUBMITTED", "已提交");
        STATUS_MAP.put("SAMPLE", "小样测试中");
        STATUS_MAP.put("APPROVED", "已核准");
        STATUS_MAP.put("PRODUCTION", "已下发生产");
        STATUS_MAP.put("REJECTED", "已驳回");
        STATUS_MAP.put("OBSOLETE", "已作废");
    }

    @Override
    public Page<FormulaVO> page(Integer pageNum, Integer pageSize, String keyword, String status) {
        LambdaQueryWrapper<DyeingFormula> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(DyeingFormula::getFormulaNo, keyword)
                    .or().like(DyeingFormula::getFormulaName, keyword)
                    .or().like(DyeingFormula::getColorNo, keyword)
                    .or().like(DyeingFormula::getColorName, keyword));
        }
        if (StringUtils.isNotBlank(status)) {
            wrapper.eq(DyeingFormula::getStatus, status);
        }
        wrapper.orderByDesc(DyeingFormula::getCreateTime);

        Page<DyeingFormula> formulaPage = this.page(new Page<>(pageNum, pageSize), wrapper);
        Page<FormulaVO> result = new Page<>(formulaPage.getCurrent(), formulaPage.getSize(), formulaPage.getTotal());

        List<Long> userIds = formulaPage.getRecords().stream()
                .map(DyeingFormula::getCreatorId).distinct().collect(Collectors.toList());
        userIds.addAll(formulaPage.getRecords().stream()
                .map(DyeingFormula::getApproverId).filter(id -> id != null).distinct().collect(Collectors.toList()));
        Map<Long, String> userNameMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            List<SysUser> users = sysUserMapper.selectBatchIds(userIds);
            userNameMap = users.stream().collect(Collectors.toMap(SysUser::getId, SysUser::getRealName));
        }

        List<FormulaVO> voList = new ArrayList<>();
        for (DyeingFormula formula : formulaPage.getRecords()) {
            FormulaVO vo = new FormulaVO();
            vo.setId(formula.getId());
            vo.setFormulaNo(formula.getFormulaNo());
            vo.setFormulaName(formula.getFormulaName());
            vo.setFabricType(formula.getFabricType());
            vo.setColorNo(formula.getColorNo());
            vo.setColorName(formula.getColorName());
            vo.setBatchSize(formula.getBatchSize());
            vo.setVersion(formula.getVersion());
            vo.setStatus(formula.getStatus());
            vo.setStatusName(STATUS_MAP.get(formula.getStatus()));
            vo.setColorDiffStandard(formula.getColorDiffStandard());
            vo.setEstimatedCod(formula.getEstimatedCod());
            vo.setCreatorName(userNameMap.get(formula.getCreatorId()));
            vo.setSubmitTime(formula.getSubmitTime());
            vo.setApproverName(formula.getApproverId() != null ? userNameMap.get(formula.getApproverId()) : null);
            vo.setApproveTime(formula.getApproveTime());
            vo.setProductionTime(formula.getProductionTime());
            vo.setRejectReason(formula.getRejectReason());
            vo.setRemark(formula.getRemark());
            vo.setCreateTime(formula.getCreateTime());
            voList.add(vo);
        }
        result.setRecords(voList);
        return result;
    }

    @Override
    public FormulaDetailVO getDetail(Long id) {
        DyeingFormula formula = this.getById(id);
        if (formula == null) {
            throw new BusinessException("配方不存在");
        }

        FormulaDetailVO vo = new FormulaDetailVO();
        vo.setId(formula.getId());
        vo.setFormulaNo(formula.getFormulaNo());
        vo.setFormulaName(formula.getFormulaName());
        vo.setFabricType(formula.getFabricType());
        vo.setColorNo(formula.getColorNo());
        vo.setColorName(formula.getColorName());
        vo.setBatchSize(formula.getBatchSize());
        vo.setVersion(formula.getVersion());
        vo.setParentId(formula.getParentId());
        vo.setStatus(formula.getStatus());
        vo.setColorDiffStandard(formula.getColorDiffStandard());
        vo.setEstimatedCod(formula.getEstimatedCod());
        vo.setCreatorId(formula.getCreatorId());
        vo.setRemark(formula.getRemark());

        LambdaQueryWrapper<DyeingFormulaDetail> detailWrapper = new LambdaQueryWrapper<>();
        detailWrapper.eq(DyeingFormulaDetail::getFormulaId, id);
        detailWrapper.orderByAsc(DyeingFormulaDetail::getProcessStep);
        List<DyeingFormulaDetail> details = formulaDetailMapper.selectList(detailWrapper);

        List<Long> auxIds = details.stream().map(DyeingFormulaDetail::getAuxiliaryId).collect(Collectors.toList());
        Map<Long, Auxiliary> auxMap = new HashMap<>();
        if (!auxIds.isEmpty()) {
            List<Auxiliary> auxiliaries = auxiliaryMapper.selectBatchIds(auxIds);
            auxMap = auxiliaries.stream().collect(Collectors.toMap(Auxiliary::getId, a -> a));
        }

        List<FormulaDetailVO.DetailItem> detailItems = new ArrayList<>();
        for (DyeingFormulaDetail detail : details) {
            FormulaDetailVO.DetailItem item = new FormulaDetailVO.DetailItem();
            item.setId(detail.getId());
            item.setAuxiliaryId(detail.getAuxiliaryId());
            item.setDosage(detail.getDosage());
            item.setDosageUnit(detail.getDosageUnit());
            item.setDosagePercent(detail.getDosagePercent());
            item.setProcessStep(detail.getProcessStep());
            item.setProcessStage(detail.getProcessStage());

            Auxiliary aux = auxMap.get(detail.getAuxiliaryId());
            if (aux != null) {
                item.setAuxCode(aux.getAuxCode());
                item.setAuxName(aux.getAuxName());
                item.setAuxType(aux.getAuxType());
                item.setForbiddenFlag(aux.getForbiddenFlag());
                item.setCodPerUnit(aux.getCodPerUnit());
            }
            detailItems.add(item);
        }
        vo.setDetails(detailItems);

        LambdaQueryWrapper<SampleTest> sampleWrapper = new LambdaQueryWrapper<>();
        sampleWrapper.eq(SampleTest::getFormulaId, id);
        sampleWrapper.orderByDesc(SampleTest::getCreateTime);
        List<SampleTest> sampleTests = sampleTestService.list(sampleWrapper);
        List<FormulaDetailVO.SampleTestVO> sampleTestVOs = new ArrayList<>();
        Map<Long, String> testerNameMap = new HashMap<>();
        List<Long> testerIds = sampleTests.stream().map(SampleTest::getTesterId).distinct().collect(Collectors.toList());
        if (!testerIds.isEmpty()) {
            List<SysUser> testers = sysUserMapper.selectBatchIds(testerIds);
            testerNameMap = testers.stream().collect(Collectors.toMap(SysUser::getId, SysUser::getRealName));
        }
        for (SampleTest st : sampleTests) {
            FormulaDetailVO.SampleTestVO svo = new FormulaDetailVO.SampleTestVO();
            svo.setId(st.getId());
            svo.setTestNo(st.getTestNo());
            svo.setSampleBatch(st.getSampleBatch());
            svo.setTestDate(st.getTestDate() != null ? st.getTestDate().atStartOfDay() : null);
            svo.setTesterName(testerNameMap.get(st.getTesterId()));
            svo.setColorDiffDe(st.getColorDiffDe());
            svo.setColorPassFlag(st.getColorPassFlag());
            svo.setTestConclusion(st.getTestConclusion());
            sampleTestVOs.add(svo);
        }
        vo.setSampleTests(sampleTestVOs);

        LambdaQueryWrapper<FormulaApprovalLog> logWrapper = new LambdaQueryWrapper<>();
        logWrapper.eq(FormulaApprovalLog::getFormulaId, id);
        logWrapper.orderByAsc(FormulaApprovalLog::getOperationTime);
        List<FormulaApprovalLog> logs = approvalLogMapper.selectList(logWrapper);
        Map<String, String> nodeMap = new HashMap<>();
        nodeMap.put("SUBMIT", "提交");
        nodeMap.put("SAMPLE", "小样测试");
        nodeMap.put("COLOR", "色差审核");
        nodeMap.put("STOCK", "库存核验");
        nodeMap.put("ENV", "环保核对");
        nodeMap.put("APPROVE", "最终核准");

        List<Long> operatorIds = logs.stream().map(FormulaApprovalLog::getOperatorId).distinct().collect(Collectors.toList());
        Map<Long, String> operatorNameMap = new HashMap<>();
        if (!operatorIds.isEmpty()) {
            List<SysUser> operators = sysUserMapper.selectBatchIds(operatorIds);
            operatorNameMap = operators.stream().collect(Collectors.toMap(SysUser::getId, SysUser::getRealName));
        }

        List<FormulaDetailVO.ApprovalLogVO> logVOs = new ArrayList<>();
        for (FormulaApprovalLog log : logs) {
            FormulaDetailVO.ApprovalLogVO lvo = new FormulaDetailVO.ApprovalLogVO();
            lvo.setId(log.getId());
            lvo.setApprovalNode(log.getApprovalNode());
            lvo.setApprovalNodeName(nodeMap.getOrDefault(log.getApprovalNode(), log.getApprovalNode()));
            lvo.setOperatorName(operatorNameMap.get(log.getOperatorId()));
            lvo.setOperation(log.getOperation());
            lvo.setOperationTime(log.getOperationTime());
            lvo.setComment(log.getComment());
            logVOs.add(lvo);
        }
        vo.setApprovalLogs(logVOs);

        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean saveFormula(FormulaDetailVO vo) {
        DyeingFormula formula;
        boolean isNew = (vo.getId() == null);

        if (isNew) {
            formula = new DyeingFormula();
            formula.setFormulaNo("F" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
            formula.setVersion(1);
            formula.setStatus("DRAFT");
            formula.setCreatorId(vo.getCreatorId() != null ? vo.getCreatorId() : 1L);
        } else {
            formula = this.getById(vo.getId());
            if (formula == null) {
                throw new BusinessException("配方不存在");
            }
            if (!"DRAFT".equals(formula.getStatus()) && !"REJECTED".equals(formula.getStatus())) {
                throw new BusinessException("当前状态不允许修改");
            }
        }

        formula.setFormulaName(vo.getFormulaName());
        formula.setFabricType(vo.getFabricType());
        formula.setColorNo(vo.getColorNo());
        formula.setColorName(vo.getColorName());
        formula.setBatchSize(vo.getBatchSize());
        formula.setColorDiffStandard(vo.getColorDiffStandard());
        formula.setRemark(vo.getRemark());

        BigDecimal estimatedCod = BigDecimal.ZERO;
        if (vo.getDetails() != null) {
            for (FormulaDetailVO.DetailItem item : vo.getDetails()) {
                if (item.getDosage() != null && item.getCodPerUnit() != null) {
                    estimatedCod = estimatedCod.add(item.getDosage().multiply(item.getCodPerUnit()));
                }
            }
        }
        formula.setEstimatedCod(estimatedCod);

        if (isNew) {
            this.save(formula);
        } else {
            this.updateById(formula);
        }

        if (!isNew) {
            LambdaQueryWrapper<DyeingFormulaDetail> deleteWrapper = new LambdaQueryWrapper<>();
            deleteWrapper.eq(DyeingFormulaDetail::getFormulaId, formula.getId());
            formulaDetailMapper.delete(deleteWrapper);
        }

        if (vo.getDetails() != null) {
            int step = 1;
            for (FormulaDetailVO.DetailItem item : vo.getDetails()) {
                DyeingFormulaDetail detail = new DyeingFormulaDetail();
                detail.setFormulaId(formula.getId());
                detail.setAuxiliaryId(item.getAuxiliaryId());
                detail.setDosage(item.getDosage());
                detail.setDosageUnit(item.getDosageUnit() != null ? item.getDosageUnit() : "kg");
                detail.setDosagePercent(item.getDosagePercent());
                detail.setProcessStep(item.getProcessStep() != null ? item.getProcessStep() : step++);
                detail.setProcessStage(item.getProcessStage());
                formulaDetailMapper.insert(detail);
            }
        }

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean submitFormula(FormulaSubmitDTO dto) {
        DyeingFormula formula = this.getById(dto.getFormulaId());
        if (formula == null) {
            throw new BusinessException("配方不存在");
        }
        if (!"DRAFT".equals(formula.getStatus()) && !"REJECTED".equals(formula.getStatus())) {
            throw new BusinessException("当前状态不允许提交");
        }

        validateForbiddenAuxiliaries(formula.getId());

        LambdaQueryWrapper<DyeingFormulaDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DyeingFormulaDetail::getFormulaId, formula.getId());
        List<DyeingFormulaDetail> details = formulaDetailMapper.selectList(wrapper);
        if (details.isEmpty()) {
            throw new BusinessException("配方明细不能为空");
        }

        auxiliaryStockService.checkStockAvailability(details);

        formula.setStatus("SUBMITTED");
        formula.setSubmitTime(LocalDateTime.now());
        this.updateById(formula);

        FormulaApprovalLog log = new FormulaApprovalLog();
        log.setFormulaId(formula.getId());
        log.setApprovalNode("SUBMIT");
        log.setOperatorId(dto.getSubmitterId() != null ? dto.getSubmitterId() : 1L);
        log.setOperation("SUBMIT");
        log.setOperationTime(LocalDateTime.now());
        log.setComment(dto.getRemark());
        approvalLogMapper.insert(log);

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean approveFormula(Long id, Long userId, String comment) {
        DyeingFormula formula = this.getById(id);
        if (formula == null) {
            throw new BusinessException("配方不存在");
        }

        SampleTest sampleTest = sampleTestService.getByFormulaId(id);
        if (sampleTest == null || sampleTest.getColorPassFlag() == null || sampleTest.getColorPassFlag() != 1) {
            throw new BusinessException("色差未达标，不能核准下发");
        }

        LambdaQueryWrapper<DyeingFormulaDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DyeingFormulaDetail::getFormulaId, id);
        List<DyeingFormulaDetail> details = formulaDetailMapper.selectList(wrapper);
        auxiliaryStockService.checkStockAvailability(details);

        formula.setStatus("APPROVED");
        formula.setApproverId(userId);
        formula.setApproveTime(LocalDateTime.now());
        this.updateById(formula);

        FormulaApprovalLog log = new FormulaApprovalLog();
        log.setFormulaId(id);
        log.setApprovalNode("APPROVE");
        log.setOperatorId(userId);
        log.setOperation("PASS");
        log.setOperationTime(LocalDateTime.now());
        log.setComment(comment);
        approvalLogMapper.insert(log);

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean rejectFormula(Long id, Long userId, String rejectReason) {
        DyeingFormula formula = this.getById(id);
        if (formula == null) {
            throw new BusinessException("配方不存在");
        }

        formula.setStatus("REJECTED");
        formula.setRejectReason(rejectReason);
        this.updateById(formula);

        FormulaApprovalLog log = new FormulaApprovalLog();
        log.setFormulaId(id);
        log.setApprovalNode("APPROVE");
        log.setOperatorId(userId);
        log.setOperation("REJECT");
        log.setOperationTime(LocalDateTime.now());
        log.setComment(rejectReason);
        approvalLogMapper.insert(log);

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean issueProduction(Long id, Long userId) {
        DyeingFormula formula = this.getById(id);
        if (formula == null) {
            throw new BusinessException("配方不存在");
        }
        if (!"APPROVED".equals(formula.getStatus())) {
            throw new BusinessException("配方未核准，不能下发生产");
        }

        SampleTest sampleTest = sampleTestService.getByFormulaId(id);
        if (sampleTest == null || sampleTest.getColorPassFlag() == null || sampleTest.getColorPassFlag() != 1) {
            throw new BusinessException("色差未达标，不能下发生产");
        }

        boolean canSchedule = wastewaterService.checkAndReserveQuota(
                formula.getId(), formula.getEstimatedCod(), userId);

        if (!canSchedule) {
            productionScheduleService.createDelayedSchedule(
                    formula.getId(), formula.getEstimatedCod(), "当日废水COD额度不足，已自动延期");
            throw new BusinessException("当日废水排放额度不足，已自动安排延期排产");
        }

        formula.setStatus("PRODUCTION");
        formula.setProductionTime(LocalDateTime.now());
        this.updateById(formula);

        productionScheduleService.createSchedule(formula.getId(), userId);

        LambdaQueryWrapper<DyeingFormulaDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DyeingFormulaDetail::getFormulaId, id);
        List<DyeingFormulaDetail> details = formulaDetailMapper.selectList(wrapper);
        auxiliaryStockService.deductStock(details, formula.getFormulaNo(), userId);

        FormulaApprovalLog log = new FormulaApprovalLog();
        log.setFormulaId(id);
        log.setApprovalNode("ENV");
        log.setOperatorId(userId);
        log.setOperation("PASS");
        log.setOperationTime(LocalDateTime.now());
        log.setComment("环保核对通过，下发生产");
        approvalLogMapper.insert(log);

        return true;
    }

    @Override
    public void validateForbiddenAuxiliaries(Long formulaId) {
        LambdaQueryWrapper<DyeingFormulaDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DyeingFormulaDetail::getFormulaId, formulaId);
        List<DyeingFormulaDetail> details = formulaDetailMapper.selectList(wrapper);

        List<Long> auxIds = details.stream()
                .map(DyeingFormulaDetail::getAuxiliaryId).distinct().collect(Collectors.toList());
        if (auxIds.isEmpty()) {
            return;
        }

        List<Auxiliary> auxiliaries = auxiliaryMapper.selectBatchIds(auxIds);
        List<String> forbiddenNames = auxiliaries.stream()
                .filter(a -> a.getForbiddenFlag() != null && a.getForbiddenFlag() == 1)
                .map(Auxiliary::getAuxName)
                .collect(Collectors.toList());

        if (!forbiddenNames.isEmpty()) {
            throw new BusinessException("配方中包含禁限用助剂：" + String.join("、", forbiddenNames));
        }
    }

    @Override
    public BigDecimal calculateEstimatedCod(Long formulaId) {
        LambdaQueryWrapper<DyeingFormulaDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DyeingFormulaDetail::getFormulaId, formulaId);
        List<DyeingFormulaDetail> details = formulaDetailMapper.selectList(wrapper);

        BigDecimal total = BigDecimal.ZERO;
        if (details.isEmpty()) {
            return total;
        }

        List<Long> auxIds = details.stream()
                .map(DyeingFormulaDetail::getAuxiliaryId).distinct().collect(Collectors.toList());
        Map<Long, Auxiliary> auxMap = auxiliaryMapper.selectBatchIds(auxIds)
                .stream().collect(Collectors.toMap(Auxiliary::getId, a -> a));

        for (DyeingFormulaDetail detail : details) {
            Auxiliary aux = auxMap.get(detail.getAuxiliaryId());
            if (aux != null && aux.getCodPerUnit() != null && detail.getDosage() != null) {
                total = total.add(detail.getDosage().multiply(aux.getCodPerUnit()));
            }
        }

        return total.setScale(4, RoundingMode.HALF_UP);
    }
}
