package com.step.train.controller;

import com.step.train.annotation.CurrentUser;
import com.step.train.annotation.LoginRequired;
import com.step.train.domain.entity.FeeOrder;
import com.step.train.domain.entity.JsonResult;
import com.step.train.domain.entity.SsoUser;
import com.step.train.service.CourseService;
import com.step.train.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by lxl on 19/2/14.
 */
@RestController
@RequestMapping("/api/order")
public class OrderController {

    //直接上级 分 30%
    private static final float LAST_PERCENT = 0.3F;
    //直接上级的上级 分 100%
    private static final float SECOND_PERCENT = 0.1F;


    @Autowired
    private CourseService courseService;
    @Autowired
    private UserService userService;

    /**
     * 普通用户购买会员
     * @param order
     * @param currentUser
     * @return
     */
    @PostMapping("/buy_vip")
    @LoginRequired
    public Object buyVip(@RequestBody FeeOrder order, @CurrentUser SsoUser currentUser){
        //判断会员课程是否存在

        //判断上级用户及上上级用户是否存在

        //生成订单

        return new JsonResult<>();
    }

    @PostMapping("/buy_course")
    @LoginRequired
    public Object buyCourse(@RequestBody FeeOrder order, @CurrentUser SsoUser currentUser){
        //判断是否收费课程

        //判断上级用户及上上级用户是否存在

        //生成订单

        return new JsonResult<>();
    }

}
