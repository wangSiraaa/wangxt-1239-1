package com.dyeing.formula.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dyeing.formula.entity.Auxiliary;

import java.util.List;

public interface AuxiliaryService extends IService<Auxiliary> {

    Page<Auxiliary> page(Integer pageNum, Integer pageSize, String keyword, Integer forbiddenFlag);

    List<Auxiliary> listAvailable();

    List<Auxiliary> listForbidden();
}
