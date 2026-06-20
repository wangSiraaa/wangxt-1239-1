package com.dyeing.formula.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dyeing.formula.entity.Auxiliary;
import com.dyeing.formula.mapper.AuxiliaryMapper;
import com.dyeing.formula.service.AuxiliaryService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuxiliaryServiceImpl extends ServiceImpl<AuxiliaryMapper, Auxiliary> implements AuxiliaryService {

    @Override
    public Page<Auxiliary> page(Integer pageNum, Integer pageSize, String keyword, Integer forbiddenFlag) {
        LambdaQueryWrapper<Auxiliary> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Auxiliary::getAuxCode, keyword)
                    .or().like(Auxiliary::getAuxName, keyword));
        }
        if (forbiddenFlag != null) {
            wrapper.eq(Auxiliary::getForbiddenFlag, forbiddenFlag);
        }
        wrapper.orderByDesc(Auxiliary::getCreateTime);
        return this.page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public List<Auxiliary> listAvailable() {
        LambdaQueryWrapper<Auxiliary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Auxiliary::getForbiddenFlag, 0);
        wrapper.orderByAsc(Auxiliary::getAuxCode);
        return this.list(wrapper);
    }

    @Override
    public List<Auxiliary> listForbidden() {
        LambdaQueryWrapper<Auxiliary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Auxiliary::getForbiddenFlag, 1);
        wrapper.orderByDesc(Auxiliary::getUpdateTime);
        return this.list(wrapper);
    }
}
