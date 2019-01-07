package com.step.db;

import com.step.entity.User2;
import com.step.repository.User2Mongodb;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.util.Assert;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by Administrator on 12/19/2018.
 */

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {MongodbConfig.class})
@FixMethodOrder
public class MongodbTest {
    private static Logger logger = LoggerFactory.getLogger(MongodbTest.class);

    @SuppressWarnings("SpringJavaAutowiringInspection") @Autowired
    User2Mongodb user2Mongodb;
    @Before
    public void setup(){
        Set<String> roles = new HashSet<>();
        roles.add("manage");
        User2 user = new User2("1", "user", "12345678", "name", "email@com.cn", new Date(), roles);
        user2Mongodb.save(user);

    }


    @Test
    public void findAll(){
        List<User2> users = user2Mongodb.findAll();
        Assert.notNull(users);
        for(User2 user: users){
            logger.info("===user=== userid:{}, username:{}, pass:{}, registrationDate:{}",
                    user.getUserId(), user.getUsername(), user.getPassword(), user.getRegistrationDate());
        }
    }
}
