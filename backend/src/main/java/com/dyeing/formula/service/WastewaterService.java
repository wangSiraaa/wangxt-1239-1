package com.dyeing.formula.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dyeing.formula.entity.WastewaterDailyQuota;
import com.dyeing.formula.entity.WastewaterLog;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface WastewaterService extends IService<WastewaterDailyQuota> {

    Page<WastewaterDailyQuota> pageQuota(Integer pageNum, Integer pageSize, LocalDate startDate, LocalDate endDate);

    Page<WastewaterLog> pageLog(Integer pageNum, Integer pageSize, Long formulaId, LocalDate startDate, LocalDate endDate, String checkStatus);

    WastewaterDailyQuota getByDate(LocalDate date);

    boolean checkAndReserveQuota(Long formulaId, BigDecimal estimatedCod, Long userId);

    List<WastewaterDailyQuota> getAvailableQuotas(BigDecimal requiredCod, int daysAhead);
}
