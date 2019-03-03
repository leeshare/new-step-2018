package com.step.train.controller;


import com.github.pagehelper.PageInfo;
import com.step.train.configuration.Config;
import com.step.train.domain.entity.Course;
import com.step.train.domain.entity.JsonResult;
import com.step.train.domain.entity.SsoOrganization;
import com.step.train.domain.entity.SsoUser;
import com.step.train.model.PageQo;
import com.step.train.model.WechatQo;
import com.step.train.service.CourseService;
import com.step.train.service.OrgService;
import com.step.train.service.UserService;
import com.step.train.service.WechatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Created by lxl on 19/2/15.
 */
@RestController
@RequestMapping("/api/wechat/")
public class WxController {

    @Autowired
    private WechatService wechatService;
    @Autowired
    private UserService userService;
    @Autowired
    private CourseService courseService;
    @Autowired
    private OrgService orgService;
    @Autowired
    private Config config;

    @PostMapping("login")
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

    @PostMapping("/course/list")
    public Object search(@RequestBody PageQo param){
        param.setStatus((byte)1);
        param.setIsShow((byte)1);
        param.setOrgId(0);
        PageInfo<Course> pageInfo = courseService.findPage(param);
        List<Course> courseList = pageInfo.getList();
        for (Course info: courseList) {
            if (info.getCreatedUserId() > 0) {
                SsoUser createdUser = userService.findById(info.getCreatedUserId());
                if (createdUser != null)
                    info.setCreatedUserName(createdUser.getRealName());
            }
            if (info.getUpdatedUserId() > 0) {
                SsoUser updatedUser = userService.findById(info.getUpdatedUserId());
                if (updatedUser != null)
                    info.setUpdatedUserName(updatedUser.getRealName());
            }
            if(info.getOrgId() > 0){
                SsoOrganization org = orgService.findById(info.getOrgId());
                if(org != null)
                    info.setOrgName(org.getName());
            }
            if(!StringUtils.isEmpty(info.getCoursePhoto())){
                String base = config.getFile_server_addr();
                base = base.indexOf("http://") < 0 ? "http://" + base : base;
                info.setCoursePhotoFull(base + "/" + info.getCoursePhoto());
            }
            if(info.getTeacherId() > 0){
                SsoUser teacher = userService.findById(info.getTeacherId());
                if(teacher != null){
                    info.setTeacherName(teacher.getRealName());
                }
            }
        }
        pageInfo.setList(courseList);
        return new JsonResult<>(pageInfo);
    }

}
