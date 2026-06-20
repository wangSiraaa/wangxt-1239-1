package com.dyeing.formula.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dyeing.formula.dto.FormulaSubmitDTO;
import com.dyeing.formula.entity.DyeingFormula;
import com.dyeing.formula.vo.FormulaDetailVO;
import com.dyeing.formula.vo.FormulaVO;

public interface DyeingFormulaService extends IService<DyeingFormula> {

    Page<FormulaVO> page(Integer pageNum, Integer pageSize, String keyword, String status);

    FormulaDetailVO getDetail(Long id);

    boolean saveFormula(FormulaDetailVO vo);

    boolean submitFormula(FormulaSubmitDTO dto);

    boolean approveFormula(Long id, Long userId, String comment);

    boolean rejectFormula(Long id, Long userId, String rejectReason);

    boolean issueProduction(Long id, Long userId);

    void validateForbiddenAuxiliaries(Long formulaId);

    java.math.BigDecimal calculateEstimatedCod(Long formulaId);
}
