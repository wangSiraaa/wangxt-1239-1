package com.dyeing.formula.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dyeing.formula.entity.*;
import com.dyeing.formula.exception.BusinessException;
import com.dyeing.formula.mapper.*;
import com.dyeing.formula.service.AuxiliaryStockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuxiliaryStockServiceImpl extends ServiceImpl<AuxiliaryStockMapper, AuxiliaryStock> implements AuxiliaryStockService {

    @Autowired
    private AuxiliaryMapper auxiliaryMapper;

    @Autowired
    private AuxiliaryStockLogMapper stockLogMapper;

    @Override
    public Page<AuxiliaryStock> page(Integer pageNum, Integer pageSize, Long auxiliaryId, String warehouse) {
        LambdaQueryWrapper<AuxiliaryStock> wrapper = new LambdaQueryWrapper<>();
        if (auxiliaryId != null) {
            wrapper.eq(AuxiliaryStock::getAuxiliaryId, auxiliaryId);
        }
        if (warehouse != null && !warehouse.trim().isEmpty()) {
            wrapper.eq(AuxiliaryStock::getWarehouse, warehouse);
        }
        wrapper.orderByDesc(AuxiliaryStock::getUpdateTime);
        return this.page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public AuxiliaryStock getByAuxiliaryId(Long auxiliaryId) {
        LambdaQueryWrapper<AuxiliaryStock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AuxiliaryStock::getAuxiliaryId, auxiliaryId);
        wrapper.last("LIMIT 1");
        return this.getOne(wrapper);
    }

    @Override
    public Map<Long, BigDecimal> getStockQuantityMap(List<Long> auxiliaryIds) {
        if (auxiliaryIds == null || auxiliaryIds.isEmpty()) {
            return new HashMap<>();
        }
        LambdaQueryWrapper<AuxiliaryStock> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(AuxiliaryStock::getAuxiliaryId, auxiliaryIds);
        List<AuxiliaryStock> stocks = this.list(wrapper);
        return stocks.stream()
                .collect(Collectors.toMap(
                        AuxiliaryStock::getAuxiliaryId,
                        AuxiliaryStock::getQuantity,
                        BigDecimal::add
                ));
    }

    @Override
    public void checkStockAvailability(List<DyeingFormulaDetail> details) {
        if (details == null || details.isEmpty()) {
            return;
        }

        Map<Long, BigDecimal> requiredMap = new HashMap<>();
        for (DyeingFormulaDetail detail : details) {
            Long auxId = detail.getAuxiliaryId();
            BigDecimal dosage = detail.getDosage();
            if (dosage == null) continue;
            requiredMap.merge(auxId, dosage, BigDecimal::add);
        }

        if (requiredMap.isEmpty()) {
            return;
        }

        List<Long> auxIds = new ArrayList<>(requiredMap.keySet());
        List<AuxiliaryStock> stocks = this.listByIds(auxIds);
        Map<Long, BigDecimal> stockMap = stocks.stream()
                .collect(Collectors.toMap(AuxiliaryStock::getAuxiliaryId, AuxiliaryStock::getQuantity, BigDecimal::add));

        List<Auxiliary> auxiliaries = auxiliaryMapper.selectBatchIds(auxIds);
        Map<Long, String> auxNameMap = auxiliaries.stream()
                .collect(Collectors.toMap(Auxiliary::getId, Auxiliary::getAuxName));

        List<String> insufficient = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : requiredMap.entrySet()) {
            Long auxId = entry.getKey();
            BigDecimal required = entry.getValue();
            BigDecimal available = stockMap.getOrDefault(auxId, BigDecimal.ZERO);
            if (available.compareTo(required) < 0) {
                String name = auxNameMap.getOrDefault(auxId, "助剂ID:" + auxId);
                insufficient.add(name + "(需" + required + "kg, 库存" + available + "kg)");
            }
        }

        if (!insufficient.isEmpty()) {
            throw new BusinessException("以下助剂库存不足：" + String.join("；", insufficient));
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deductStock(List<DyeingFormulaDetail> details, String refBillNo, Long operatorId) {
        if (details == null || details.isEmpty()) {
            return;
        }

        for (DyeingFormulaDetail detail : details) {
            LambdaQueryWrapper<AuxiliaryStock> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(AuxiliaryStock::getAuxiliaryId, detail.getAuxiliaryId())
                   .orderByAsc(AuxiliaryStock::getExpireDate)
                   .last("LIMIT 1");
            AuxiliaryStock stock = this.getOne(wrapper);

            if (stock == null) {
                continue;
            }

            BigDecimal beforeQty = stock.getQuantity();
            BigDecimal afterQty = beforeQty.subtract(detail.getDosage());
            if (afterQty.compareTo(BigDecimal.ZERO) < 0) {
                afterQty = BigDecimal.ZERO;
            }

            stock.setQuantity(afterQty);
            this.updateById(stock);

            AuxiliaryStockLog log = new AuxiliaryStockLog();
            log.setAuxiliaryId(detail.getAuxiliaryId());
            log.setOptType("出库");
            log.setQuantity(detail.getDosage().negate());
            log.setBeforeQuantity(beforeQty);
            log.setAfterQuantity(afterQty);
            log.setRefBillNo(refBillNo);
            log.setOperatorId(operatorId);
            log.setRemark("配方生产出库");
            log.setCreateTime(LocalDateTime.now());
            stockLogMapper.insert(log);
        }
    }
}
