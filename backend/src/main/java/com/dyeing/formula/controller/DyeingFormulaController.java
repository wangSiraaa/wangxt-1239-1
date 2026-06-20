package com.dyeing.formula.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dyeing.formula.dto.FormulaSubmitDTO;
import com.dyeing.formula.entity.DyeingFormula;
import com.dyeing.formula.service.DyeingFormulaService;
import com.dyeing.formula.vo.FormulaDetailVO;
import com.dyeing.formula.vo.FormulaVO;
import com.dyeing.formula.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/formula")
public class DyeingFormulaController {

    @Autowired
    private DyeingFormulaService formulaService;

    @GetMapping("/page")
    public Result<Page<FormulaVO>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                         @RequestParam(defaultValue = "10") Integer pageSize,
                                         @RequestParam(required = false) String keyword,
                                         @RequestParam(required = false) String status) {
        return Result.success(formulaService.page(pageNum, pageSize, keyword, status));
    }

    @GetMapping("/{id}")
    public Result<FormulaDetailVO> getDetail(@PathVariable Long id) {
        return Result.success(formulaService.getDetail(id));
    }

    @PostMapping("/save")
    public Result<Boolean> saveFormula(@RequestBody FormulaDetailVO vo) {
        return Result.success(formulaService.saveFormula(vo));
    }

    @PostMapping("/submit")
    public Result<Boolean> submitFormula(@RequestBody FormulaSubmitDTO dto) {
        return Result.success(formulaService.submitFormula(dto));
    }

    @PostMapping("/approve")
    public Result<Boolean> approveFormula(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Long userId = params.get("userId") != null ? Long.valueOf(params.get("userId").toString()) : 1L;
        String comment = params.get("comment") != null ? params.get("comment").toString() : null;
        return Result.success(formulaService.approveFormula(id, userId, comment));
    }

    @PostMapping("/reject")
    public Result<Boolean> rejectFormula(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Long userId = params.get("userId") != null ? Long.valueOf(params.get("userId").toString()) : 1L;
        String rejectReason = params.get("rejectReason") != null ? params.get("rejectReason").toString() : "未通过审核";
        return Result.success(formulaService.rejectFormula(id, userId, rejectReason));
    }

    @PostMapping("/issue/{id}")
    public Result<Boolean> issueProduction(@PathVariable Long id,
                                            @RequestParam(required = false) Long userId) {
        if (userId == null) userId = 5L;
        return Result.success(formulaService.issueProduction(id, userId));
    }

    @GetMapping("/validate/{id}")
    public Result<Void> validateForbidden(@PathVariable Long id) {
        formulaService.validateForbiddenAuxiliaries(id);
        return Result.success();
    }

    @GetMapping("/cod/{id}")
    public Result<java.math.BigDecimal> calculateCod(@PathVariable Long id) {
        return Result.success(formulaService.calculateEstimatedCod(id));
    }
}
