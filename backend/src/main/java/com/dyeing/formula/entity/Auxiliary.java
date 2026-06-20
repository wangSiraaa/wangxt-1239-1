package com.dyeing.formula.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("auxiliary")
public class Auxiliary implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String auxCode;

    private String auxName;

    private String auxType;

    private String casNo;

    private String unit;

    private Integer forbiddenFlag;

    private String forbiddenReason;

    private BigDecimal codPerUnit;

    private String description;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
