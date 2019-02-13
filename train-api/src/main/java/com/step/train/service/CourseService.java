package com.step.train.service;

import com.github.pagehelper.PageInfo;
import com.step.train.domain.entity.Course;
import com.step.train.domain.repository.CourseRepository;
import com.step.train.model.PageQo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * Created by Administrator on 2/13/2019.
 */
@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public Course findById(int id){
        return courseRepository.findById(id);
    }

    public List<Course> findByName(String name, int id){
        return courseRepository.findByName(name, id);
    }

    public PageInfo<Course> findPage(PageQo condition) {
        int limit = condition.getSize();
        int offset = (condition.getPage() - 1) * limit;
        int total = courseRepository.findCount(condition.getStatus(), condition.getKeyword());
        List<Course> list = courseRepository.find(offset, limit, condition.getStatus(), condition.getKeyword());

        PageInfo<Course> pageInfo = new PageInfo<>(list);
        pageInfo.setTotal(total);
        pageInfo.setHasNextPage(condition.getPage() * limit < total);
        return pageInfo;
    }

    public String save(Course course){
        List<Course> listCourse = courseRepository.findByName(course.getName(), course.getId());
        if(listCourse != null && listCourse.size() > 0){
            return "课程名称已存在";
        }
        course.setUpdatedDate(new Date());
        if(course.getIsDelete() == null){
            course.setIsDelete((byte)0);
        }
        Course newCourse = courseRepository.save(course);
        if(newCourse.getId() > 0){
            return "";
        }
        return "课程保存出错";

    }

}
