package com.dyeing.formula.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dyeing.formula.entity.*;
import com.dyeing.formula.mapper.*;
import com.dyeing.formula.service.WastewaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class WastewaterServiceImpl extends ServiceImpl<WastewaterDailyQuotaMapper, WastewaterDailyQuota> implements WastewaterService {

    @Autowired
    private WastewaterLogMapper wastewaterLogMapper;

    @Override
    public Page<WastewaterDailyQuota> pageQuota(Integer pageNum, Integer pageSize, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<WastewaterDailyQuota> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(WastewaterDailyQuota::getQuotaDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(WastewaterDailyQuota::getQuotaDate, endDate);
        }
        wrapper.orderByDesc(WastewaterDailyQuota::getQuotaDate);
        return this.page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Page<WastewaterLog> pageLog(Integer pageNum, Integer pageSize, Long formulaId, LocalDate startDate, LocalDate endDate, String checkStatus) {
        LambdaQueryWrapper<WastewaterLog> wrapper = new LambdaQueryWrapper<>();
        if (formulaId != null) {
            wrapper.eq(WastewaterLog::getFormulaId, formulaId);
        }
        if (startDate != null) {
            wrapper.ge(WastewaterLog::getProductionDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(WastewaterLog::getProductionDate, endDate);
        }
        if (checkStatus != null && !checkStatus.trim().isEmpty()) {
            wrapper.eq(WastewaterLog::getCheckStatus, checkStatus);
        }
        wrapper.orderByDesc(WastewaterLog::getCreateTime);
        return new Page<>(pageNum, pageSize);
    }

    @Override
    public WastewaterDailyQuota getByDate(LocalDate date) {
        LambdaQueryWrapper<WastewaterDailyQuota> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WastewaterDailyQuota::getQuotaDate, date);
        wrapper.last("LIMIT 1");
        return this.getOne(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean checkAndReserveQuota(Long formulaId, BigDecimal estimatedCod, Long userId) {
        if (estimatedCod == null) {
            return true;
        }

        LocalDate today = LocalDate.now();
        WastewaterDailyQuota quota = getOrCreateQuota(today);

        BigDecimal estimatedCodKg = estimatedCod.divide(new BigDecimal("1000"), 4, java.math.RoundingMode.HALF_UP);

        if (quota.getRemainingCodQuota().compareTo(estimatedCodKg) < 0) {
            return false;
        }

        quota.setUsedCodQuota(quota.getUsedCodQuota().add(estimatedCodKg));
        quota.setRemainingCodQuota(quota.getRemainingCodQuota().subtract(estimatedCodKg));
        this.updateById(quota);

        WastewaterLog log = new WastewaterLog();
        log.setLogNo("W" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        log.setFormulaId(formulaId);
        log.setProductionDate(today);
        log.setEstimatedCod(estimatedCod);
        log.setCheckerId(userId);
        log.setCheckTime(LocalDateTime.now());
        log.setCheckStatus("CHECKED");
        log.setRemark("排产预占COD额度：" + estimatedCodKg.setScale(2, java.math.RoundingMode.HALF_UP) + "kg");
        wastewaterLogMapper.insert(log);

        return true;
    }

    @Override
    public List<WastewaterDailyQuota> getAvailableQuotas(BigDecimal requiredCod, int daysAhead) {
        List<WastewaterDailyQuota> result = new ArrayList<>();
        BigDecimal requiredCodKg = requiredCod.divide(new BigDecimal("1000"), 4, java.math.RoundingMode.HALF_UP);
        LocalDate today = LocalDate.now();

        for (int i = 0; i < daysAhead; i++) {
            LocalDate date = today.plusDays(i);
            WastewaterDailyQuota quota = getOrCreateQuota(date);
            if (quota.getRemainingCodQuota().compareTo(requiredCodKg) >= 0) {
                result.add(quota);
            }
        }
        return result;
    }

    private WastewaterDailyQuota getOrCreateQuota(LocalDate date) {
        WastewaterDailyQuota quota = getByDate(date);
        if (quota == null) {
            quota = new WastewaterDailyQuota();
            quota.setQuotaDate(date);
            quota.setTotalCodQuota(new BigDecimal("500.00"));
            quota.setUsedCodQuota(BigDecimal.ZERO);
            quota.setRemainingCodQuota(new BigDecimal("500.00"));
            quota.setTotalWaterQuota(new BigDecimal("1000.00"));
            quota.setUsedWaterQuota(BigDecimal.ZERO);
            quota.setStatus("ACTIVE");
            this.save(quota);
        }
        return quota;
    }
}
