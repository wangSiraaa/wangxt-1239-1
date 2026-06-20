package com.dyeing.formula.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dyeing.formula.entity.ProductionSchedule;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface ProductionScheduleService extends IService<ProductionSchedule> {

    Page<ProductionSchedule> page(Integer pageNum, Integer pageSize, String status, LocalDate startDate, LocalDate endDate, Long formulaId);

    boolean createSchedule(Long formulaId, Long operatorId);

    boolean createDelayedSchedule(Long formulaId, BigDecimal estimatedCod, String reason);

    boolean cancelSchedule(Long id, Long operatorId);
}
