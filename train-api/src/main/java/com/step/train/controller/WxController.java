package com.step.train.controller;


import com.step.train.domain.entity.JsonResult;
import com.step.train.domain.entity.SsoUser;
import com.step.train.model.WechatQo;
import com.step.train.service.UserService;
import com.step.train.service.WechatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by lxl on 19/2/15.
 */
@RestController
@RequestMapping("/api/login")
public class WxController {

    @Autowired
    private WechatService wechatService;
    @Autowired
    private UserService userService;

    @PostMapping("/wechat")
    public Object login(@RequestBody WechatQo param){
        try {
            SsoUser user = wechatService.wxLogin(param);
            SsoUser u = new SsoUser();
            u.setId(user.getId());
            u.setRealName(user.getRealName());
            u.setPhoto(user.getPhoto());
            String ticket = userService.addLoginTicket(u.getId());
            //u.setTicket(user.getTicket());
            u.setTicket(ticket);
            return new JsonResult<>(u);
        } catch (Exception e) {
            e.printStackTrace();
            return new JsonResult<>(e.getMessage());
        }
    }

}
