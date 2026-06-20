package com.dyeing.formula.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("production_schedule")
public class ProductionSchedule implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String scheduleNo;

    private Long formulaId;

    private LocalDate planDate;

    private String scheduleStatus;

    private String delayReason;

    private LocalDate delayToDate;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private String machineNo;

    private Long operatorId;

    private BigDecimal codLoad;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @TableField(exist = false)
    public LocalDate getScheduleDate() {
        return this.planDate;
    }

    @TableField(exist = false)
    public Integer getDelayedFlag() {
        return (this.delayToDate != null || "DELAYED".equals(this.scheduleStatus)) ? 1 : 0;
    }
}
