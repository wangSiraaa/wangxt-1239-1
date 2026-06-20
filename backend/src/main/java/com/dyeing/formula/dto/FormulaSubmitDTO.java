package com.dyeing.formula.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class FormulaSubmitDTO implements Serializable {

    private Long formulaId;

    private Long submitterId;

    private String remark;
}
