package com.step;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.math.BigDecimal;

/**
 * Created by lxl on 18/12/3.
 */

@RestController
public class HelloRestController {
    @RequestMapping("/")
    String index(){
        return "Hello Spring Boot";
    }

    @RequestMapping("/getName")
    String name(){
        return "John";
    }

    /**
     * 第一种返回json方式
     * @return
     */
    @RequestMapping("/getUser")
    User test(){
        User user = new User();
        user.setId(new BigDecimal(12));
        user.setUserName("john");
        user.setSex("man");
        return user;

    }
}
