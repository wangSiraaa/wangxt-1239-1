package com.dyeing.formula.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FormulaVO implements Serializable {

    private Long id;

    private String formulaNo;

    private String formulaName;

    private String fabricType;

    private String colorNo;

    private String colorName;

    private BigDecimal batchSize;

    private Integer version;

    private String status;

    private String statusName;

    private BigDecimal colorDiffStandard;

    private BigDecimal estimatedCod;

    private String creatorName;

    private LocalDateTime submitTime;

    private String approverName;

    private LocalDateTime approveTime;

    private LocalDateTime productionTime;

    private String rejectReason;

    private String remark;

    private LocalDateTime createTime;
}
