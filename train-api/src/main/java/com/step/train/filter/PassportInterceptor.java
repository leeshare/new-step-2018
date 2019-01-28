package com.step.train.filter;

import com.step.train.domain.entity.LoginTicket;
import com.step.train.domain.entity.SsoUser;
import com.step.train.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

//@Component
public class PassportInterceptor implements HandlerInterceptor {

    @Autowired
    UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse httpServletResponse, Object o) throws Exception {
        String ticket = null;
        if(request.getCookies() != null){
            for(Cookie cookie : request.getCookies()){
                if(cookie.getName().equals("ticket")){
                    ticket = cookie.getValue();
                    System.out.println("拦截器拦截到的cookie=="+ticket);
                    break;
                }
            }
        }

        request.getParameter("username");
        if(ticket != null){
            LoginTicket ticketObj = userService.getLoginTicket(ticket);
            if(ticketObj == null || ticketObj.getUserId() <= 0){
                return false;
            }else {
                SsoUser user = userService.findById(ticketObj.getUserId());
                return checkAuth(user);
            }
        }else {
            return false;
        }
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
