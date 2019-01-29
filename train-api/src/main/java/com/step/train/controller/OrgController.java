package com.step.train.controller;

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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class OrgController {

    @Autowired
    private OrgService orgService;
    @Autowired
    private UserService userService;

    @PostMapping("/api/orgList")
    public Object list(@RequestBody Param param) {
        if(param == null){
            return new JsonResult<SsoOrganization>("请登录");
        }
        String ticket = param.getTicket();
        if(StringUtils.isEmpty(ticket)){
            return new JsonResult<SsoOrganization>("请登录");
        }
        SsoUser currUser = userService.getCurrentUser(ticket);
        if(currUser == null){
            return new JsonResult<SsoOrganization>("请重新登录");
        }
        if(userService.checkIsRoot(currUser)){
            List<SsoOrganization> orgList =  orgService.findAll();
            return new JsonResult<List<SsoOrganization>>(orgList);
        }else {
            return new JsonResult<SsoOrganization>("您没有读取机构列表权限");
        }
    }
}
