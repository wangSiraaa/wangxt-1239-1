package com.dyeing.formula.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dyeing.formula.entity.AuxiliaryStock;
import com.dyeing.formula.entity.DyeingFormulaDetail;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface AuxiliaryStockService extends IService<AuxiliaryStock> {

    Page<AuxiliaryStock> page(Integer pageNum, Integer pageSize, Long auxiliaryId, String warehouse);

    AuxiliaryStock getByAuxiliaryId(Long auxiliaryId);

    Map<Long, BigDecimal> getStockQuantityMap(List<Long> auxiliaryIds);

    void checkStockAvailability(List<DyeingFormulaDetail> details);

    void deductStock(List<DyeingFormulaDetail> details, String refBillNo, Long operatorId);
}
