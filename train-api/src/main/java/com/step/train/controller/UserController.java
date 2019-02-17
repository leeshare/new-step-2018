package com.step.train.controller;

import com.github.pagehelper.PageInfo;
import com.step.train.annotation.CurrentUser;
import com.step.train.annotation.LoginRequired;
import com.step.train.domain.entity.JsonResult;
import com.step.train.domain.entity.Param;
import com.step.train.domain.entity.SsoUser;
import com.step.train.model.SsoUserQo;
import com.step.train.service.AccessLogService;
import com.step.train.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

/**
 * Created by Administrator on 2/11/2019.
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private AccessLogService accessLogService;

    @PostMapping("/list")
    @LoginRequired
    public Object list(@RequestBody(required = false) SsoUserQo param, @CurrentUser SsoUser currentUser){
        if(currentUser == null || currentUser.getId() <= 0){
            return new JsonResult<>("请登录");
        }
        if(userService.checkIsRoot(currentUser)) {
            param.setOrgId(0);
        }else {
            param.setOrgId(currentUser.getOrgId());
        }
        PageInfo<SsoUser> pageInfo = userService.findPage(param);
        return new JsonResult<>(pageInfo);
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
            if(userService.checkIsRoot(user)){
                return new JsonResult<>("您没有修改此用户的权限！");
            }
        }
        user.setCreatedUserId(currentUser.getId());
        user.setUpdatedUserId(currentUser.getId());
        int result = userService.save(user);
        if(result > 0){
            return new JsonResult<>(user);
        }
        String msg = result == -1 ? "新增用户名已存在!" : result == -2 ? "修改用户名已存在!" : "用户保存出错!";
        return new JsonResult<>(msg);
    }

    @PostMapping("/del")
    @LoginRequired
    public Object del(@RequestBody int userId, @CurrentUser SsoUser currentUser) {
        if (currentUser == null || currentUser.getId() <= 0) {
            return new JsonResult<SsoUser>("请登录");
        }

        if(userId > 0){
            SsoUser user = userService.findById(userId);
            if(user != null && user.getId() > 0){
                if (!userService.checkIsRoot(currentUser)) {
                    if(userService.checkIsRoot(user)) {
                        return new JsonResult<SsoUser>("您没有删除此用户权限");
                    }
                }
                user.setIsDelete((byte) 1);
                user.setUpdatedDate(new Date());
                user.setUpdatedUserId(currentUser.getId());
                userService.save(user);
                return new JsonResult<SsoUser>();
            }
        }

        return new JsonResult<SsoUser>("找不到用户");
    }

    @PostMapping("/change_pwd")
    @LoginRequired
    public Object changePwd(@RequestBody SsoUserQo param, @CurrentUser SsoUser currentUser) {
        String oldPwdMd5 = DigestUtils.md5DigestAsHex(param.getOldPwd().getBytes());
        if(!oldPwdMd5.equals(currentUser.getPassword())){
            int num = accessLogService.checkAccessLog(currentUser.getId(), false, true);

            return new JsonResult<SsoUser>(String.format("旧密码失败%d次", num));
        }
        if(StringUtils.isEmpty(param.getNewPwd())){
            return new JsonResult<SsoUser>("请设置新密码");
        }
        String newPwdMd5 = DigestUtils.md5DigestAsHex(param.getNewPwd().getBytes());
        currentUser.setPassword(newPwdMd5);
        int result = userService.save(currentUser);
        if(result > 0){
            return new JsonResult<>();
        }
        String msg = result == -1 ? "新增用户名已存在!" : result == -2 ? "修改用户名已存在!" : "用户保存出错!";
        return new JsonResult<>(msg);


    }


}
