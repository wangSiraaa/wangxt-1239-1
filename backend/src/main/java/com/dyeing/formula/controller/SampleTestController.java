package com.dyeing.formula.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dyeing.formula.dto.SampleTestSubmitDTO;
import com.dyeing.formula.entity.SampleTest;
import com.dyeing.formula.service.SampleTestService;
import com.dyeing.formula.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/sample")
public class SampleTestController {

    @Autowired
    private SampleTestService sampleTestService;

    @GetMapping("/page")
    public Result<Page<SampleTest>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                         @RequestParam(defaultValue = "10") Integer pageSize,
                                         @RequestParam(required = false) Long formulaId,
                                         @RequestParam(required = false) String conclusion) {
        return Result.success(sampleTestService.page(pageNum, pageSize, formulaId, conclusion));
    }

    @GetMapping("/formula/{formulaId}")
    public Result<SampleTest> getByFormulaId(@PathVariable Long formulaId) {
        return Result.success(sampleTestService.getByFormulaId(formulaId));
    }

    @PostMapping("/submit")
    public Result<Boolean> submitTest(@RequestBody SampleTestSubmitDTO dto) {
        return Result.success(sampleTestService.submitTest(dto));
    }

    @GetMapping("/calculate")
    public Result<BigDecimal> calculateColorDiff(@RequestParam BigDecimal l1,
                                                  @RequestParam BigDecimal a1,
                                                  @RequestParam BigDecimal b1,
                                                  @RequestParam BigDecimal l2,
                                                  @RequestParam BigDecimal a2,
                                                  @RequestParam BigDecimal b2) {
        return Result.success(sampleTestService.calculateColorDiff(l1, a1, b1, l2, a2, b2));
    }
}
