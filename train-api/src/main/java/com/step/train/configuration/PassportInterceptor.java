package com.step.train.configuration;

import com.step.train.annotation.LoginRequired;
import com.step.train.domain.entity.LoginTicket;
import com.step.train.domain.entity.SsoUser;
import com.step.train.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;

public class PassportInterceptor implements HandlerInterceptor {

    @Autowired
    UserService userService;

    /*public PassportInterceptor(UserService userService){
        this.userService = userService;
    }*/

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 如果不是映射到方法直接通过
        if(!(handler instanceof HandlerMethod)){
            return true;
        }
        HandlerMethod handlerMethod = (HandlerMethod)handler;
        Method method = handlerMethod.getMethod();

        // 判断接口是否需要登录
        LoginRequired methodAnnotation = method.getAnnotation(LoginRequired.class);
        // 有 @LoginRequired 注解，需要认证
        if(methodAnnotation != null){
            String ticket = request.getHeader("ticket");
            if (ticket == null) {
                throw new RuntimeException("无ticket，请重新登录");
            }
            LoginTicket ticketObj = userService.getLoginTicket(ticket);
            if(ticketObj == null || ticketObj.getUserId() <= 0){
                return false;
            }else {
                SsoUser user = userService.findById(ticketObj.getUserId());
                //return checkAuth(user);
                if(user == null)
                    return false;
                request.setAttribute("currentUser", user);
                return true;
            }
        }



        /*String ticket = null;
        if(request.getCookies() != null){
            for(Cookie cookie : request.getCookies()){
                if(cookie.getName().equals("ticket")){
                    ticket = cookie.getValue();
                    System.out.println("拦截器拦截到的cookie=="+ticket);
                    break;
                }
            }
        }*/

        return false;
    }

    private Boolean checkAuth(SsoUser user){
        if(user == null){
            return false;
        }
        //验证用户权限
        return true;


    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {

    }
}
