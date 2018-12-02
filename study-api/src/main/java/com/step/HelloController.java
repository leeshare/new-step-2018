package com.step;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by lxl on 18/12/2.
 */
@RestController
public class HelloController {

    @RequestMapping("/")
    String index(){
        return "Hello Spring Boot";
    }

    @RequestMapping("/getName")
    String name(){
        return "John";
    }
}
