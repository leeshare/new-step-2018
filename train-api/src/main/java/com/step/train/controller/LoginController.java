package com.step.train.controller;

import com.step.train.domain.entity.JsonResult;
import com.step.train.domain.entity.SsoUser;
import com.step.train.domain.entity.SsoUserAccessLog;
import com.step.train.exception.DataException;
import com.step.train.service.AccessLogService;
import com.step.train.service.ImageCode;
import com.step.train.service.UserService;
import com.sun.org.apache.xpath.internal.operations.Bool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Date;
import java.util.Map;
import org.springframework.util.DigestUtils;

@RestController
@RequestMapping("/api/login")
public class LoginController {

    @Autowired
    private UserService userService;
    @Autowired
    private AccessLogService accessLogService;

    //@RequestMapping(value = "/login", method = RequestMethod.POST)
    //@RequestMapping(value = "/login")
    //public Object login(String userName, String pwd, String code)
    //@PostMapping("/login")
    //public Object login(@RequestParam(value = "username", required = false) String username, @RequestParam(value = "pwd", required = false) String pwd)

    @PostMapping("")
    public Object login(@RequestBody SsoUser params)
    {
        int result = 0;
        int userId = 0; //通过用户名查到的用户Id
        byte errorNum = 0;   //登录时密码错误次数
        String username = "", pwd = "";

        if(params == null){
            result = -1;
        }else {
            username = params.getUserName();
            pwd = params.getPassword();
        }

        SsoUser u = new SsoUser();
        if(StringUtils.isEmpty(username) || StringUtils.isEmpty(pwd) //|| StringUtils.isEmpty(code)
                ){
            result = -1;
        }else {
            SsoUser user = userService.findByUserName(username);
            if(user != null && user.getId() > 0) {
                userId = user.getId();
                //验证 log
                int tempResult = checkAccessLog(userId, false, false);
                if(tempResult < 0){
                    result = tempResult;
                }else {
                    //返回0 表示查不到任何登录记录
                    if(tempResult > 0)
                        errorNum = (byte)tempResult;
                    String pwd_md5 = DigestUtils.md5DigestAsHex(pwd.getBytes());
                    if (pwd_md5.equalsIgnoreCase(user.getPassword())) {
                        u.setId(userId);
                        u.setRealName(user.getRealName());
                        u.setSsoRoles(user.getSsoRoles());



                        String ticket = userService.addLoginTicket(userId);
                        u.setTicket(ticket);

                        checkAccessLog(userId, true, true);

                        result = 1;
                    }else {
                        //本次登录失败
                        errorNum += 1;
                        checkAccessLog(userId, false, true);
                        if(errorNum > 5)
                            result = -3;
                        else
                            result = -4;
                    }

                }


            }else {
                result = -2;
            }
        }

        switch (result){
            case -1:
                return new JsonResult<SsoUser>("用户名或密码为空");
            case -2:
                //用户不存在
                return new JsonResult<SsoUser>("用户名或密码错误");
            case -3:
                //密码错误超过5次，距离上次失败不到一小时，请稍后再试
                return new JsonResult<SsoUser>("密码错误，已失败超过5次, 距离上次登录尝试不到一小时，请稍后再试");
            case -4:
                //用户存在，但密码错误小于5次
                return new JsonResult<SsoUser>(String.format("密码错误, 已失败%d", errorNum));
            case 1:
                return new JsonResult<SsoUser>(u);
            default:
                return new JsonResult<SsoUser>("未知错误");
        }
    }

    @RequestMapping(value = "/images/imagecode")
    public String imagecode(HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        OutputStream os = response.getOutputStream();
        Map<String,Object> map = ImageCode.getImageCode(60, 20, os);

        String simpleCaptcha = "simpleCaptcha";
        request.getSession().setAttribute(simpleCaptcha, map.get("strEnsure").toString().toLowerCase());
        request.getSession().setAttribute("codeTime",new Date().getTime());

        try {
            ImageIO.write((BufferedImage) map.get("image"), "JPEG", os);
        } catch (IOException e) {
            return "";
        }
        return null;
    }

    @RequestMapping(value = "/checkcode")
    @ResponseBody
    public String checkcode(HttpServletRequest request, HttpSession session)
            throws Exception {
        String checkCode = request.getParameter("checkCode");
        Object cko = session.getAttribute("simpleCaptcha") ; //验证码对象
        if(cko == null){
            request.setAttribute("errorMsg", "验证码已失效，请重新输入！");
            return "验证码已失效，请重新输入！";
        }

        String captcha = cko.toString();
        Date now = new Date();
        Long codeTime = Long.valueOf(session.getAttribute("codeTime")+"");
        if(StringUtils.isEmpty(checkCode) || captcha == null ||  !(checkCode.equalsIgnoreCase(captcha))){
            request.setAttribute("errorMsg", "验证码错误！");
            return "验证码错误！";
        }else if ((now.getTime()-codeTime)/1000/60>5){//验证码有效时长为5分钟
            request.setAttribute("errorMsg", "验证码已失效，请重新输入！");
            return "验证码已失效，请重新输入！";
        }else {
            session.removeAttribute("simpleCaptcha");
            return "1";
        }
    }

    /**
     * 用户登录 查询/保存
     * @param userId    用户Id
     * @param isPass    是否当前验证通过
     * @param isSetLog  是查询还是设置
     * @return
     */
    private int checkAccessLog(Integer userId, Boolean isPass, Boolean isSetLog){
        int result = 0;
        Byte errorNum = 0;
        SsoUserAccessLog log = accessLogService.findByUserId(userId);
        if(log != null && log.getId() > 0){
            errorNum = log.getFailPwdCount();
            Date _now = new Date();
            if(log.getFailPwdCount() > 5){
                log.setFailPwdCount((byte)(errorNum + 1));
                if(_now.getTime() - log.getFailPwdStartTime().getTime() > 1000 * 60 * 60){
                    //已超过5次，但距离上次错误已过了1小时了
                    result = errorNum;
                }else {
                    log.setFailPwdStartTime(_now);
                    //密码错误超过5次，距离上次失败不到一小时，请稍后再试
                    result = -3;
                }
            }else {
                result = errorNum; //未超过5次，可以继续尝试
                //log.setFailPwdCount((byte)(errorNum + 1));
                //log.setFailPwdStartTime(_now);
            }
            if(isSetLog && result >= 0){
                if(isPass){
                    log.setFailPwdCount((byte)0);
                    log.setLastLoginTime(_now);
                    result = 0;
                }else {
                    log.setFailPwdCount((byte)(errorNum + 1));
                    log.setFailPwdStartTime(_now);
                    result = errorNum + 1; //未超过5次，可以继续尝试
                }
                accessLogService.saveLog(log);
            }
        }else {
            if (isSetLog) {
                log = new SsoUserAccessLog();
                Date _now = new Date();
                log.setUserId(userId);
                log.setCreatedDate(_now);
                if (isPass) {
                    log.setFailPwdCount((byte) 0);
                    log.setLastLoginTime(_now);
                    result = 0;
                } else {
                    log.setFailPwdCount(errorNum);
                    log.setFailPwdStartTime(_now);
                    result = 1; //未超过5次，可以继续尝试
                }
                accessLogService.saveLog(log);
            }else {
                result = 0;
            }
        }
        return result;
    }
}
