package com.step.db;

import com.step.entity.Department;
import com.step.entity.Role;
import com.step.entity.User;
import com.step.repository.UserRedis;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by Administrator on 12/4/2018.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {RedisConfig.class, UserRedis.class})
public class RedisTest {
    private static Logger logger = LoggerFactory.getLogger(RedisTest.class);

    @Autowired
    UserRedis userRedis;

    @Before
    public void setup(){
        Department department = new Department();
        department.setName("测试部");

        Role role = new Role();
        role.setName("测试经理");

        User user = new User();
        user.setName("小马");
        user.setCreatedata(new Date());
        user.setDepartment(department);

        List<Role> roles = new ArrayList<>();
        roles.add(role);

        user.setRoles(roles);

        userRedis.delete(this.getClass().getName() + ": userByname: " + user.getName());
        userRedis.add(this.getClass().getName() + ": userByname: " + user.getName(), 10L, user);
    }

    @Test
    public void get(){
        User user = userRedis.get(this.getClass().getName() + ": userByname: 小马");
        Assert.notNull(user);
        logger.info("=====user===== name: {}, department: {}, role: {}", user.getName(), user.getDepartment().getName(), user.getRoles().get(0).getName());
    }
}
