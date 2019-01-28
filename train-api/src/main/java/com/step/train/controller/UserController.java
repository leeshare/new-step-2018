package com.step.train.controller;

//import com.step.train.repository.SsoUserRepository;
import com.step.train.domain.entity.JsonResult;
import com.step.train.domain.entity.SsoRole;
import com.step.train.domain.entity.SsoUser;
import com.step.train.domain.repository.UserRedis;
import com.step.train.exception.MyException;
import com.step.train.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private static Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    UserRedis userRedis;
    @Autowired
    UserService userService;

    /*@RequestMapping("/index")
    public ModelAndView index(){
        return new ModelAndView("api/user/index");
    }*/

    @RequestMapping("/json")
    public String json() throws MyException {
        throw new MyException("发生错误2");
    }

    @RequestMapping("/json2")
    public Object json2() {
        String hello = DigestUtils.md5DigestAsHex("XN_cheerup".getBytes());
        return new JsonResult<SsoUser>(hello);
    }


    @RequestMapping("/redis_set")
    public Object setup(){
        SsoRole role = new SsoRole();
        role.setName("经理");
        role.setType((byte)3);

        SsoUser user = new SsoUser();
        user.setId(1);
        user.setRealName("小马");
        user.setCreatedDate(new Date());

        List<SsoRole> roles = new ArrayList<>();
        roles.add(role);
        user.setSsoRoles(roles);

        userRedis.delete(this.getClass().getName() + ": userById: " + user.getId());
        userRedis.add(this.getClass().getName() + ": userById: " + user.getId(), 10L, user);
        return new JsonResult<SsoUser>();
    }

    @RequestMapping("/redis_get")
    public Object get(){
        SsoUser user = userRedis.get(this.getClass().getName() + ": userById: 1");
        return new JsonResult<SsoUser>(user);
    }


    @RequestMapping("/s")
    public String s(){
        return "1";
    }

    @RequestMapping(value = "/session", method = RequestMethod.POST)
    @ResponseBody
    public Object session(HttpServletRequest request) {
        HttpSession session = request.getSession();
        if (session.getAttribute("user") == null) {
            //用户登录之后才去调用，将session和user绑定在一起。
            session.setAttribute("user", "zhangsan");
            System.out.println("不存在session");
        } else {
            System.out.println("存在session");
        }

        Map<String, Object> map = new HashMap<>();
        map.put("sessionId", session.getId());
        map.put("message", session.getAttribute("user"));

        return new JsonResult<Map>(map);
    }


}
