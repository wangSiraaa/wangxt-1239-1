package com.dyeing.formula.dto;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SampleTestSubmitDTO implements Serializable {

    private Long formulaId;

    private Long testerId;

    private String sampleBatch;

    private LocalDate testDate;

    private BigDecimal labColorL;

    private BigDecimal labColorA;

    private BigDecimal labColorB;

    private BigDecimal stdColorL;

    private BigDecimal stdColorA;

    private BigDecimal stdColorB;

    private String rubbingFastness;

    private String washingFastness;

    private String lightFastness;

    private String testReport;
}
