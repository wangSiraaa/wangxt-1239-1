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
@TableName("wastewater_log")
public class WastewaterLog implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String logNo;

    private Long formulaId;

    private LocalDate productionDate;

    private BigDecimal estimatedCod;

    private BigDecimal actualCod;

    private BigDecimal estimatedWater;

    private BigDecimal actualWater;

    private Long checkerId;

    private LocalDateTime checkTime;

    private String checkStatus;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
