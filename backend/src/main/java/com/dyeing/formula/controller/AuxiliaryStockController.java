package com.dyeing.formula.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dyeing.formula.entity.AuxiliaryStock;
import com.dyeing.formula.service.AuxiliaryStockService;
import com.dyeing.formula.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stock")
public class AuxiliaryStockController {

    @Autowired
    private AuxiliaryStockService stockService;

    @GetMapping("/page")
    public Result<Page<AuxiliaryStock>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                             @RequestParam(defaultValue = "10") Integer pageSize,
                                             @RequestParam(required = false) Long auxiliaryId,
                                             @RequestParam(required = false) String warehouse) {
        return Result.success(stockService.page(pageNum, pageSize, auxiliaryId, warehouse));
    }

    @GetMapping("/auxiliary/{auxiliaryId}")
    public Result<AuxiliaryStock> getByAuxiliaryId(@PathVariable Long auxiliaryId) {
        return Result.success(stockService.getByAuxiliaryId(auxiliaryId));
    }

    @PostMapping("/save")
    public Result<Boolean> save(@RequestBody AuxiliaryStock stock) {
        return Result.success(stockService.saveOrUpdate(stock));
    }
}
