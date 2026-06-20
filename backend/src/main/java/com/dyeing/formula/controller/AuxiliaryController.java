package com.dyeing.formula.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dyeing.formula.entity.Auxiliary;
import com.dyeing.formula.service.AuxiliaryService;
import com.dyeing.formula.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auxiliary")
public class AuxiliaryController {

    @Autowired
    private AuxiliaryService auxiliaryService;

    @GetMapping("/page")
    public Result<Page<Auxiliary>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                        @RequestParam(defaultValue = "10") Integer pageSize,
                                        @RequestParam(required = false) String keyword,
                                        @RequestParam(required = false) Integer forbiddenFlag) {
        return Result.success(auxiliaryService.page(pageNum, pageSize, keyword, forbiddenFlag));
    }

    @GetMapping("/list/available")
    public Result<List<Auxiliary>> listAvailable() {
        return Result.success(auxiliaryService.listAvailable());
    }

    @GetMapping("/list/forbidden")
    public Result<List<Auxiliary>> listForbidden() {
        return Result.success(auxiliaryService.listForbidden());
    }

    @GetMapping("/{id}")
    public Result<Auxiliary> getById(@PathVariable Long id) {
        return Result.success(auxiliaryService.getById(id));
    }

    @PostMapping("/save")
    public Result<Boolean> save(@RequestBody Auxiliary auxiliary) {
        return Result.success(auxiliaryService.saveOrUpdate(auxiliary));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(auxiliaryService.removeById(id));
    }
}
