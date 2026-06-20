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
@TableName("sample_test")
public class SampleTest implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String testNo;

    private Long formulaId;

    private String sampleBatch;

    private LocalDate testDate;

    private Long testerId;

    private BigDecimal labColorL;

    private BigDecimal labColorA;

    private BigDecimal labColorB;

    private BigDecimal stdColorL;

    private BigDecimal stdColorA;

    private BigDecimal stdColorB;

    private BigDecimal colorDiffDe;

    private BigDecimal colorDiffDl;

    private BigDecimal colorDiffDa;

    private BigDecimal colorDiffDb;

    private Integer colorPassFlag;

    private String rubbingFastness;

    private String washingFastness;

    private String lightFastness;

    private String testConclusion;

    private String testReport;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
