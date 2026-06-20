package com.dyeing.formula.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("auxiliary_stock_log")
public class AuxiliaryStockLog implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long auxiliaryId;

    private String optType;

    private BigDecimal quantity;

    private BigDecimal beforeQuantity;

    private BigDecimal afterQuantity;

    private String refBillNo;

    private Long operatorId;

    private String remark;

    private LocalDateTime createTime;
}
