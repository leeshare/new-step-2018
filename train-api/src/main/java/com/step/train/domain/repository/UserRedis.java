package com.step.train.domain.repository;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.step.train.domain.entity.SsoUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Created by Administrator on 12/4/2018.
 */
@Repository
public class UserRedis {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    public void add(String key, Long time, SsoUser user) {
        Gson gson = new Gson();
        redisTemplate.opsForValue().set(key, gson.toJson(user), time, TimeUnit.MINUTES);
    }

    public void add(String key, Long time, List<SsoUser> users){
        Gson gson = new Gson();
        redisTemplate.opsForValue().set(key, gson.toJson(users), time, TimeUnit.MINUTES);
    }

    public SsoUser get(String key){
        Gson gson = new Gson();
        SsoUser user = null;
        String userJson = redisTemplate.opsForValue().get(key);
        if(!StringUtils.isEmpty(userJson))
            user = gson.fromJson(userJson, SsoUser.class);
        return user;
    }
    public List<SsoUser> getList(String key){
        Gson gson = new Gson();
        List<SsoUser> ts = null;
        String listJson = redisTemplate.opsForValue().get(key);
        if(!StringUtils.isEmpty(listJson))
            ts = gson.fromJson(listJson, new TypeToken<List<SsoUser>>(){}.getType());
        return ts;
    }

    public void addTicket(String key, String ticket){
        redisTemplate.opsForValue().set(key, ticket, 1, TimeUnit.DAYS);
    }
    public String getTicket(String key){
        return redisTemplate.opsForValue().get(key);
    }

    public void delete(String key){
        redisTemplate.opsForValue().getOperations().delete(key);
    }

}
