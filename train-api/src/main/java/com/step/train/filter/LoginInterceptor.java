package com.step.train.filter;

import com.alibaba.fastjson.JSON;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class LoginInterceptor implements HandlerInterceptor {

    /*private boolean reLogin(HttpServletResponse response) throws IOException {
        PrintWriter out;
        try{
            FoilResult res = FoilResult.build(201,"用户需要重新登陆","login");
            out = response.getWriter();
            out.append(JSON.toJSONString(res));
            return false;
        } catch (Exception e){
            e.printStackTrace();
            response.sendError(500);
            return false;
        }
    }*/

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Object agentUser = request.getSession().getAttribute("SESSION");
        if(agentUser==null){
            //return reLogin(response);
            return false;
        }
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {

    }
}
