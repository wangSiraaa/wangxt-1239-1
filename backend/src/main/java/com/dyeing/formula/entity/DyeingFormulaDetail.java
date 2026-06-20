package com.dyeing.formula.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("dyeing_formula_detail")
public class DyeingFormulaDetail implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long formulaId;

    private Long auxiliaryId;

    private BigDecimal dosage;

    private String dosageUnit;

    private BigDecimal dosagePercent;

    private Integer processStep;

    private String processStage;

    private LocalDateTime createTime;
}
