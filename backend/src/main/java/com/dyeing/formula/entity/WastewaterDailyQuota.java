package com.dyeing.formula.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("wastewater_daily_quota")
public class WastewaterDailyQuota implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private LocalDate quotaDate;

    private BigDecimal totalCodQuota;

    private BigDecimal usedCodQuota;

    private BigDecimal remainingCodQuota;

    private BigDecimal totalWaterQuota;

    private BigDecimal usedWaterQuota;

    private String status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
