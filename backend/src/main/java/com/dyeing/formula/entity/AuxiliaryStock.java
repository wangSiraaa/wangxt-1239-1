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
@TableName("auxiliary_stock")
public class AuxiliaryStock implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long auxiliaryId;

    private String warehouse;

    private String batchNo;

    private BigDecimal quantity;

    private BigDecimal safetyStock;

    private LocalDate expireDate;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
