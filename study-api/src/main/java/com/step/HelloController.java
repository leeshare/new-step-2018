package com.step;

import com.alibaba.fastjson.JSON;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.math.BigDecimal;

/**
 * Created by lxl on 18/12/2.
 */

@Controller
public class HelloController {

    /**
     * 第二种返回json方式
     * @return
     */
    @ResponseBody
    @RequestMapping("/getUser2")
    User2 test2(){
        User2 user = new User2();
        user.setId(new BigDecimal(12));
        user.setUserName("john");
        user.setSex("man");
        return user;
    }

    /**
     * 第三种返回json方式
     * 通过alibaba的fastjson来返回
     * @param response
     * @return
     */
    @RequestMapping("/getUser3")
    public String testByFastJson(HttpServletResponse response){
        User2 user = new User2();
        user.setId(new BigDecimal(12));
        user.setUserName("john");
        user.setSex("man");

        String data = JSON.toJSONString(user);
        try {
            sendJsonData(response, data);
        } catch(Exception e){
            e.printStackTrace();
        }
        return null;
    }

    protected void sendJsonData(HttpServletResponse response, String data) throws Exception{
        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.println(data);
        out.flush();
        out.close();
    }

}
