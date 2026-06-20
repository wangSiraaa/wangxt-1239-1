package com.dyeing.formula.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dyeing.formula.entity.DyeingFormula;
import com.dyeing.formula.entity.ProductionSchedule;
import com.dyeing.formula.entity.WastewaterDailyQuota;
import com.dyeing.formula.exception.BusinessException;
import com.dyeing.formula.mapper.DyeingFormulaMapper;
import com.dyeing.formula.mapper.ProductionScheduleMapper;
import com.dyeing.formula.service.ProductionScheduleService;
import com.dyeing.formula.service.WastewaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ProductionScheduleServiceImpl extends ServiceImpl<ProductionScheduleMapper, ProductionSchedule> implements ProductionScheduleService {

    @Autowired
    private DyeingFormulaMapper formulaMapper;

    @Autowired
    private WastewaterService wastewaterService;

    @Override
    public Page<ProductionSchedule> page(Integer pageNum, Integer pageSize, String status, LocalDate startDate, LocalDate endDate, Long formulaId) {
        LambdaQueryWrapper<ProductionSchedule> wrapper = new LambdaQueryWrapper<>();
        if (formulaId != null) {
            wrapper.eq(ProductionSchedule::getFormulaId, formulaId);
        }
        if (status != null && !status.trim().isEmpty()) {
            wrapper.eq(ProductionSchedule::getScheduleStatus, status);
        }
        if (startDate != null) {
            wrapper.ge(ProductionSchedule::getPlanDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProductionSchedule::getPlanDate, endDate);
        }
        wrapper.orderByDesc(ProductionSchedule::getCreateTime);
        return this.page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public boolean cancelSchedule(Long id, Long operatorId) {
        ProductionSchedule schedule = this.getById(id);
        if (schedule == null) {
            throw new BusinessException("排产单不存在");
        }
        if (!"SCHEDULED".equals(schedule.getScheduleStatus()) && !"DELAYED".equals(schedule.getScheduleStatus())) {
            throw new BusinessException("当前状态不可取消");
        }
        schedule.setScheduleStatus("CANCELLED");
        return this.updateById(schedule);
    }

    @Override
    public boolean createSchedule(Long formulaId, Long operatorId) {
        DyeingFormula formula = formulaMapper.selectById(formulaId);
        if (formula == null) {
            throw new BusinessException("配方不存在");
        }

        ProductionSchedule schedule = new ProductionSchedule();
        schedule.setScheduleNo("P" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        schedule.setFormulaId(formulaId);
        schedule.setPlanDate(LocalDate.now());
        schedule.setScheduleStatus("SCHEDULED");
        schedule.setOperatorId(operatorId);
        schedule.setCodLoad(formula.getEstimatedCod());
        return this.save(schedule);
    }

    @Override
    public boolean createDelayedSchedule(Long formulaId, BigDecimal estimatedCod, String reason) {
        DyeingFormula formula = formulaMapper.selectById(formulaId);
        if (formula == null) {
            throw new BusinessException("配方不存在");
        }

        List<WastewaterDailyQuota> availableQuotas = wastewaterService.getAvailableQuotas(estimatedCod, 7);

        LocalDate delayDate;
        if (availableQuotas != null && !availableQuotas.isEmpty()) {
            delayDate = availableQuotas.get(0).getQuotaDate();
        } else {
            delayDate = LocalDate.now().plusDays(1);
        }

        ProductionSchedule schedule = new ProductionSchedule();
        schedule.setScheduleNo("P" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        schedule.setFormulaId(formulaId);
        schedule.setPlanDate(delayDate);
        schedule.setScheduleStatus("DELAYED");
        schedule.setDelayReason(reason);
        schedule.setDelayToDate(delayDate);
        schedule.setCodLoad(estimatedCod);
        return this.save(schedule);
    }
}
