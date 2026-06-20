package com.dyeing.formula.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dyeing.formula.dto.SampleTestSubmitDTO;
import com.dyeing.formula.entity.SampleTest;

import java.math.BigDecimal;

public interface SampleTestService extends IService<SampleTest> {

    Page<SampleTest> page(Integer pageNum, Integer pageSize, Long formulaId, String conclusion);

    SampleTest getByFormulaId(Long formulaId);

    boolean submitTest(SampleTestSubmitDTO dto);

    BigDecimal calculateColorDiff(BigDecimal l1, BigDecimal a1, BigDecimal b1,
                              BigDecimal l2, BigDecimal a2, BigDecimal b2);

    boolean isColorDiffPass(Long formulaId, BigDecimal colorDiffDe);
}
