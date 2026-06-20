package com.dyeing.formula.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dyeing.formula.dto.SampleTestSubmitDTO;
import com.dyeing.formula.entity.*;
import com.dyeing.formula.exception.BusinessException;
import com.dyeing.formula.mapper.*;
import com.dyeing.formula.service.SampleTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class SampleTestServiceImpl extends ServiceImpl<SampleTestMapper, SampleTest> implements SampleTestService {

    @Autowired
    private DyeingFormulaMapper formulaMapper;

    @Autowired
    private FormulaApprovalLogMapper approvalLogMapper;

    @Override
    public Page<SampleTest> page(Integer pageNum, Integer pageSize, Long formulaId, String conclusion) {
        LambdaQueryWrapper<SampleTest> wrapper = new LambdaQueryWrapper<>();
        if (formulaId != null) {
            wrapper.eq(SampleTest::getFormulaId, formulaId);
        }
        if (conclusion != null && !conclusion.trim().isEmpty()) {
            wrapper.eq(SampleTest::getTestConclusion, conclusion);
        }
        wrapper.orderByDesc(SampleTest::getCreateTime);
        return this.page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public SampleTest getByFormulaId(Long formulaId) {
        LambdaQueryWrapper<SampleTest> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SampleTest::getFormulaId, formulaId);
        wrapper.orderByDesc(SampleTest::getCreateTime);
        wrapper.last("LIMIT 1");
        return this.getOne(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean submitTest(SampleTestSubmitDTO dto) {
        DyeingFormula formula = formulaMapper.selectById(dto.getFormulaId());
        if (formula == null) {
            throw new BusinessException("配方不存在");
        }

        SampleTest test = new SampleTest();
        test.setTestNo("S" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        test.setFormulaId(dto.getFormulaId());
        test.setSampleBatch(dto.getSampleBatch());
        test.setTestDate(dto.getTestDate());
        test.setTesterId(dto.getTesterId() != null ? dto.getTesterId() : 2L);
        test.setLabColorL(dto.getLabColorL());
        test.setLabColorA(dto.getLabColorA());
        test.setLabColorB(dto.getLabColorB());
        test.setStdColorL(dto.getStdColorL());
        test.setStdColorA(dto.getStdColorA());
        test.setStdColorB(dto.getStdColorB());
        test.setRubbingFastness(dto.getRubbingFastness());
        test.setWashingFastness(dto.getWashingFastness());
        test.setLightFastness(dto.getLightFastness());
        test.setTestReport(dto.getTestReport());

        BigDecimal de = calculateColorDiff(
                dto.getLabColorL(), dto.getLabColorA(), dto.getLabColorB(),
                dto.getStdColorL(), dto.getStdColorA(), dto.getStdColorB()
        );
        test.setColorDiffDe(de);

        if (dto.getLabColorL() != null && dto.getStdColorL() != null) {
            test.setColorDiffDl(dto.getLabColorL().subtract(dto.getStdColorL()));
        }
        if (dto.getLabColorA() != null && dto.getStdColorA() != null) {
            test.setColorDiffDa(dto.getLabColorA().subtract(dto.getStdColorA()));
        }
        if (dto.getLabColorB() != null && dto.getStdColorB() != null) {
            test.setColorDiffDb(dto.getLabColorB().subtract(dto.getStdColorB()));
        }

        boolean pass = isColorDiffPass(dto.getFormulaId(), de);
        test.setColorPassFlag(pass ? 1 : 0);
        test.setTestConclusion(pass ? "PASS" : "FAIL");

        this.save(test);

        if ("SUBMITTED".equals(formula.getStatus())) {
            formula.setStatus("SAMPLE");
            formulaMapper.updateById(formula);
        }

        FormulaApprovalLog log = new FormulaApprovalLog();
        log.setFormulaId(dto.getFormulaId());
        log.setApprovalNode("SAMPLE");
        log.setOperatorId(dto.getTesterId() != null ? dto.getTesterId() : 2L);
        log.setOperation(pass ? "PASS" : "REJECT");
        log.setOperationTime(LocalDateTime.now());
        log.setComment("小样测试结果：ΔE=" + de.setScale(2, RoundingMode.HALF_UP)
                + "，标准ΔE≤" + formula.getColorDiffStandard()
                + "，结论：" + (pass ? "合格" : "不合格"));
        approvalLogMapper.insert(log);

        return true;
    }

    @Override
    public BigDecimal calculateColorDiff(BigDecimal l1, BigDecimal a1, BigDecimal b1,
                                          BigDecimal l2, BigDecimal a2, BigDecimal b2) {
        if (l1 == null || a1 == null || b1 == null || l2 == null || a2 == null || b2 == null) {
            return null;
        }
        double dl = l1.subtract(l2).doubleValue();
        double da = a1.subtract(a2).doubleValue();
        double db = b1.subtract(b2).doubleValue();
        double de = Math.sqrt(dl * dl + da * da + db * db);
        return BigDecimal.valueOf(de).setScale(4, RoundingMode.HALF_UP);
    }

    @Override
    public boolean isColorDiffPass(Long formulaId, BigDecimal colorDiffDe) {
        if (colorDiffDe == null) {
            return false;
        }
        DyeingFormula formula = formulaMapper.selectById(formulaId);
        if (formula == null || formula.getColorDiffStandard() == null) {
            return colorDiffDe.compareTo(new BigDecimal("1.0")) <= 0;
        }
        return colorDiffDe.compareTo(formula.getColorDiffStandard()) <= 0;
    }
}
