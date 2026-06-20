package com.dyeing.formula.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dyeing.formula.entity.ProductionSchedule;
import com.dyeing.formula.entity.WastewaterDailyQuota;
import com.dyeing.formula.entity.WastewaterLog;
import com.dyeing.formula.service.ProductionScheduleService;
import com.dyeing.formula.service.WastewaterService;
import com.dyeing.formula.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/wastewater")
public class WastewaterController {

    @Autowired
    private WastewaterService wastewaterService;

    @Autowired
    private ProductionScheduleService scheduleService;

    @GetMapping("/quota/page")
    public Result<Page<WastewaterDailyQuota>> pageQuota(@RequestParam(defaultValue = "1") Integer pageNum,
                                                        @RequestParam(defaultValue = "10") Integer pageSize,
                                                        @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                                                        @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(wastewaterService.pageQuota(pageNum, pageSize, startDate, endDate));
    }

    @GetMapping("/quota/today")
    public Result<WastewaterDailyQuota> getToday() {
        return Result.success(wastewaterService.getByDate(LocalDate.now()));
    }

    @GetMapping("/quota/available")
    public Result<List<WastewaterDailyQuota>> getAvailable(@RequestParam BigDecimal requiredCod,
                                                            @RequestParam(defaultValue = "7") Integer daysAhead) {
        return Result.success(wastewaterService.getAvailableQuotas(requiredCod, daysAhead));
    }

    @GetMapping("/log/page")
    public Result<Page<WastewaterLog>> pageLog(@RequestParam(defaultValue = "1") Integer pageNum,
                                                @RequestParam(defaultValue = "10") Integer pageSize,
                                                @RequestParam(required = false) Long formulaId,
                                                @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                                                @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
                                                @RequestParam(required = false) String checkStatus) {
        return Result.success(wastewaterService.pageLog(pageNum, pageSize, formulaId, startDate, endDate, checkStatus));
    }

    @GetMapping("/schedule/page")
    public Result<Page<ProductionSchedule>> pageSchedule(@RequestParam(defaultValue = "1") Integer pageNum,
                                                          @RequestParam(defaultValue = "10") Integer pageSize,
                                                          @RequestParam(required = false) Long formulaId,
                                                          @RequestParam(required = false) String status,
                                                          @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                                                          @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(scheduleService.page(pageNum, pageSize, status, startDate, endDate, formulaId));
    }
}
