package com.dyeing.formula.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dyeing.formula.entity.SysRole;
import com.dyeing.formula.entity.SysUser;
import com.dyeing.formula.mapper.SysRoleMapper;
import com.dyeing.formula.mapper.SysUserMapper;
import com.dyeing.formula.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");

        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, username);
        wrapper.last("LIMIT 1");
        SysUser user = sysUserMapper.selectOne(wrapper);

        if (user == null) {
            return Result.error("用户不存在");
        }
        if (user.getStatus() == 0) {
            return Result.error("用户已被禁用");
        }

        SysRole role = sysRoleMapper.selectById(user.getRoleId());

        Map<String, Object> data = new HashMap<>();
        data.put("token", "dyeing-token-" + user.getId() + "-" + System.currentTimeMillis());
        data.put("userId", user.getId());
        data.put("username", user.getUsername());
        data.put("realName", user.getRealName());
        data.put("roleId", user.getRoleId());
        data.put("roleCode", role != null ? role.getRoleCode() : null);
        data.put("roleName", role != null ? role.getRoleName() : null);
        data.put("phone", user.getPhone());

        return Result.success(data);
    }

    @GetMapping("/roles")
    public Result<List<SysRole>> listRoles() {
        return Result.success(sysRoleMapper.selectList(null));
    }

    @GetMapping("/users")
    public Result<List<Map<String, Object>>> listUsers() {
        List<SysUser> users = sysUserMapper.selectList(null);
        List<Long> roleIds = users.stream().map(SysUser::getRoleId).distinct().collect(Collectors.toList());
        Map<Long, SysRole> roleMap = sysRoleMapper.selectBatchIds(roleIds)
                .stream().collect(Collectors.toMap(SysRole::getId, r -> r));

        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("realName", u.getRealName());
            m.put("roleId", u.getRoleId());
            SysRole r = roleMap.get(u.getRoleId());
            m.put("roleCode", r != null ? r.getRoleCode() : null);
            m.put("roleName", r != null ? r.getRoleName() : null);
            return m;
        }).collect(Collectors.toList());

        return Result.success(result);
    }
}
