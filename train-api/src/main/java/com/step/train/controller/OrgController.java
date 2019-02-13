package com.step.train.controller;

import com.step.train.annotation.CurrentUser;
import com.step.train.annotation.LoginRequired;
import com.step.train.domain.entity.JsonResult;
import com.step.train.domain.entity.Param;
import com.step.train.domain.entity.SsoOrganization;
import com.step.train.domain.entity.SsoUser;
import com.step.train.service.OrgService;
import com.step.train.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/org")
public class OrgController {

    @Autowired
    private OrgService orgService;
    @Autowired
    private UserService userService;

    @PostMapping("/list")
    @LoginRequired
    public Object list(@RequestBody(required = false) Param param, @CurrentUser SsoUser currentUser) {
        if(currentUser == null || currentUser.getId() <= 0){
            return new JsonResult<SsoOrganization>("请登录");
        }
        if(userService.checkIsRoot(currentUser)){
            List<SsoOrganization> orgList =  orgService.findAll();
            for (SsoOrganization organization : orgList) {
                if(organization.getCreatedUserId() > 0){
                    SsoUser createdUser = userService.findById(organization.getCreatedUserId());
                    if(createdUser != null)
                        organization.setCreatedUserName(createdUser.getRealName());
                }
                if(organization.getUpdatedUserId() > 0){
                    SsoUser updatedUser = userService.findById(organization.getUpdatedUserId());
                    if(updatedUser != null)
                        organization.setUpdatedUserName(updatedUser.getRealName());
                }
            }
            return new JsonResult<List<SsoOrganization>>(orgList);
        }else {
            return new JsonResult<SsoOrganization>("您没有读取机构列表权限");
        }
    }

    @PostMapping("/save")
    @LoginRequired
    public Object save(@RequestBody SsoOrganization org, @CurrentUser SsoUser currentUser) {
        if (currentUser == null || currentUser.getId() <= 0) {
            return new JsonResult<SsoOrganization>("请登录");
        }
        if (!userService.checkIsRoot(currentUser)) {
            return new JsonResult<SsoOrganization>("您没有读取机构列表权限");
        }
        if (org == null) {
            return new JsonResult<SsoOrganization>("请输入机构信息");
        }
        org.setUpdatedUserId(currentUser.getId());


        String result = orgService.save(org);
        if (StringUtils.isEmpty(result)) {
            return new JsonResult<SsoOrganization>();
        } else {
            return new JsonResult<SsoOrganization>(result);
        }
    }

    @PostMapping("/del")
    @LoginRequired
    public Object del(@RequestBody int orgId, @CurrentUser SsoUser currentUser) {
        if (currentUser == null || currentUser.getId() <= 0) {
            return new JsonResult<SsoOrganization>("请登录");
        }
        if (!userService.checkIsRoot(currentUser)) {
            return new JsonResult<SsoOrganization>("您没有删除机构权限");
        }
        if(orgId > 0){
            SsoOrganization org = orgService.findById(orgId);
            if(org != null && org.getId() > 0){
                org.setIsDelete((byte)1);
                org.setUpdatedDate(new Date());
                org.setUpdatedUserId(currentUser.getId());
                orgService.save(org);
                return new JsonResult<SsoOrganization>();
            }
        }

        return new JsonResult<SsoOrganization>("找不到机构");
    }

}
