package com.dyeing.formula.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("formula_approval_log")
public class FormulaApprovalLog implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long formulaId;

    private String approvalNode;

    private Long operatorId;

    private String operation;

    private LocalDateTime operationTime;

    private String comment;

    private LocalDateTime createTime;
}
