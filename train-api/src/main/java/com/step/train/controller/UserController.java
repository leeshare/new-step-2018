package com.step.train.controller;

import com.step.train.annotation.CurrentUser;
import com.step.train.annotation.LoginRequired;
import com.step.train.domain.entity.JsonResult;
import com.step.train.domain.entity.Param;
import com.step.train.domain.entity.SsoUser;
import com.step.train.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by Administrator on 2/11/2019.
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/list")
    @LoginRequired
    public Object list(@RequestBody(required = false) Param param, @CurrentUser SsoUser currentUser){
        if(currentUser == null || currentUser.getId() <= 0){
            return new JsonResult<>("请登录");
        }
        userService.findById()
    }

    @PostMapping("/save")
    @LoginRequired
    public Object save(@RequestBody SsoUser user, @CurrentUser SsoUser currentUser) {
        if (currentUser == null || currentUser.getId() <= 0) {
            return new JsonResult<SsoUser>("请登录");
        }
        if (user == null) {
            return new JsonResult<SsoUser>("请输入用户信息");
        }
        if (!userService.checkIsRoot(currentUser)) {
            if(user.getRoleType() == 1 || user.getRoleType() == 2){
                return new JsonResult<>("您没有权限！");
            }
        }
        user.setCreatedUserId(currentUser.getId());
        user.setUpdatedUserId(currentUser.getId());
        String result = userService.save(user);
        if(StringUtils.isEmpty(result)){
            return new JsonResult<>(user);
        }
        return new JsonResult<>(result);
    }
}
