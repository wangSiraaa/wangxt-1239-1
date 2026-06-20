package com.dyeing.formula.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("dyeing_formula")
public class DyeingFormula implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String formulaNo;

    private String formulaName;

    private String fabricType;

    private String colorNo;

    private String colorName;

    private BigDecimal batchSize;

    private Integer version;

    private Long parentId;

    private String status;

    private BigDecimal colorDiffStandard;

    private BigDecimal estimatedCod;

    private Long creatorId;

    private LocalDateTime submitTime;

    private Long approverId;

    private LocalDateTime approveTime;

    private LocalDateTime productionTime;

    private String rejectReason;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
