package com.step.train.controller;

import com.github.pagehelper.PageInfo;
import com.step.train.annotation.CurrentUser;
import com.step.train.annotation.LoginRequired;
import com.step.train.domain.entity.*;
import com.step.train.domain.repository.SsoOrganizationRepository;
import com.step.train.model.PageQo;
import com.step.train.service.CourseService;
import com.step.train.service.OrgService;
import com.step.train.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;

/**
 * Created by Administrator on 2/11/2019.
 */
@RestController
@RequestMapping("/api/course")
public class CourseController {

    @Autowired
    private CourseService courseService;
    @Autowired
    private UserService userService;
    @Autowired
    private OrgService orgService;

    @PostMapping("/list")
    @LoginRequired
    public Object list(@RequestBody(required = false) PageQo param, @CurrentUser SsoUser currentUser) {
        if(currentUser == null || currentUser.getId() <= 0){
            return new JsonResult<Course>("请登录");
        }
        if(userService.checkIsRoot(currentUser)) {
            param.setOrgId(0);
        }else {
            param.setOrgId(currentUser.getOrgId());
        }

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
        }
        pageInfo.setList(courseList);
        return new JsonResult<>(pageInfo);
    }

    /**
     * 课程保存
     *      会员  isShow = 0 只能有此一个这样的课程（用于用户购买会员时使用）
     *          courseType = 1，且 price > 0
     *      普通课程  isShow = 1
     * @param course
     * @param currentUser
     * @return
     */
    @PostMapping("/save")
    @LoginRequired
    public Object save(@RequestBody Course course, @CurrentUser SsoUser currentUser) {
        if (currentUser == null || currentUser.getId() <= 0) {
            return new JsonResult<Course>("请登录");
        }
        if (course == null) {
            return new JsonResult<Course>("请输入课程信息");
        }
        if(!userService.checkIsRoot(currentUser)){
            if(currentUser.getOrgId() != course.getOrgId()){
                return new JsonResult<Course>("无法保存非本机构课程");
            }
        }
        course.setUpdatedUserId(currentUser.getId());

        String result = courseService.save(course);
        if (StringUtils.isEmpty(result)) {
            return new JsonResult<Course>();
        } else {
            return new JsonResult<Course>(result);
        }
    }

    @PostMapping("/del")
    @LoginRequired
    public Object del(@RequestBody int courseId, @CurrentUser SsoUser currentUser) {
        if (currentUser == null || currentUser.getId() <= 0) {
            return new JsonResult<Course>("请登录");
        }
        if(courseId > 0){
            Course info = courseService.findById(courseId);
            if(info != null && info.getId() > 0){
                if (!userService.checkIsRoot(currentUser)) {
                    if(info.getOrgId() != currentUser.getOrgId())
                        return new JsonResult<Course>("您没有删除此机构课程的权限");
                }
                info.setIsDelete((byte) 1);
                info.setUpdatedDate(new Date());
                info.setUpdatedUserId(currentUser.getId());
                courseService.save(info);
                return new JsonResult<Course>();
            }
        }

        return new JsonResult<Course>("找不到课程");
    }
}
