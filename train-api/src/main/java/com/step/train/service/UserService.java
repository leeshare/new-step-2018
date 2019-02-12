package com.step.train.service;

//import com.step.train.repository.SsoUserRepository;


/*public interface UserService extends BaseService<SsoUser> {

}*/

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.step.train.domain.entity.LoginTicket;
import com.step.train.domain.entity.SsoRole;
import com.step.train.domain.entity.SsoUser;
import com.step.train.domain.entity.UserLevel;
import com.step.train.domain.repository.SsoRoleRepository;
import com.step.train.domain.repository.SsoUserRepository;
import com.step.train.domain.repository.UserLevelRepository;
import com.step.train.domain.repository.UserRedis;
import com.step.train.model.SsoUserQo;
import com.step.train.parameter.LinkEnum;
import com.step.train.parameter.Operator;
import com.step.train.parameter.PredicateBuilder;
import com.step.train.util.MyEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
public class UserService {

    private final String DEFAULT_PASSWORD = "a111111";

    @Autowired
    private SsoUserRepository ssoUserRepository;
    @Autowired
    private SsoRoleRepository ssoRoleRepository;

    private UserLevelRepository userLevelRepository;

    @Autowired
    UserRedis userRedis;

    private static Long TIME_MINUTES = 30L;

    public PageInfo<SsoUser> findPage(SsoUserQo ssoUserQo){
        //Pageable pageable = new PageRequest(ssoUserQo.getPage(), ssoUserQo.getSize(), new Sort(Sort.Direction.ASC, "id"));

        //PredicateBuilder pb = new PredicateBuilder();

        /*if(!StringUtils.isEmpty(ssoUserQo.getRealName())) {
            pb.add("real_name", "%" + ssoUserQo.getRealName() + "%", LinkEnum.LIKE);
        }
        if(ssoUserQo.getStatus() >= 0){
            pb.add("status", ssoUserQo.getStatus());
        }

        pb.add("is_delete", 0);*/

        //return ssoUserRepository.findAll(pb.build(), Operator.AND, pageable);

        //全部结果集中分页
        /*Iterator<SsoUser> all = ssoUserRepository.findAll(pageable).iterator();
        List<SsoUser> list = new ArrayList<>();
        while(all.hasNext()){
            list.add(all.next());
        }*/

        PageHelper.startPage(ssoUserQo.getPage(), ssoUserQo.getSize());
        List<SsoUser> list = ssoUserRepository.find(ssoUserQo.getRoleType());
        PageInfo<SsoUser> pageInfo = new PageInfo<>(list);
        return pageInfo;

    }

    public SsoUser findByUserName(String userName){
        SsoUser user = ssoUserRepository.findByUserName(userName);
        if(user != null){
            List<SsoRole> roles = ssoRoleRepository.findRolesByUser(user.getId());
            user.setSsoRoles(roles);

            String key = "user:" + user.getId();
            userRedis.add(key, TIME_MINUTES, user);
        }else {
        }
        return user;
    }

    public SsoUser findById(int id){
        String key = "user:" + id;
        SsoUser user = userRedis.get(key);
        if(user == null){
            user = ssoUserRepository.findById(id);
            if(user == null){
                user = new SsoUser();
                userRedis.add(key, TIME_MINUTES, user);
                return null;
            }else {
                List<SsoRole> roles = ssoRoleRepository.findRolesByUser(id);
                user.setSsoRoles(roles);

                userRedis.add(key, TIME_MINUTES, user);
                return user;
            }
        }else {
            return user;
        }
    }

    public String addLoginTicket(int userId){
        LoginTicket loginTicket = new LoginTicket();
        loginTicket.setUserId(userId);
        Date date = new Date();
        date.setTime(date.getTime()+1000*3600*30);
        loginTicket.setExpired(date);
        loginTicket.setStatus(0);
        loginTicket.setTicket(UUID.randomUUID().toString().replaceAll("-",""));

        String json = JSONObject.toJSONString(loginTicket);
        //System.out.println("生成ticket: "+ json);
        //int a=loginTicketDao.insertLoginticket(loginTicket);

        //userRedis.delete("userId_ticket: " + userId);
        //userRedis.addTicket("userId_ticket: " + userId, loginTicket.getTicket());
        String ticket = loginTicket.getTicket();
        userRedis.delete("ticket:" + ticket);
        userRedis.addTicket("ticket:" + ticket, json);

        return ticket;
    }

    public LoginTicket getLoginTicket(String ticket){
        String key = "ticket:" + ticket;
        String result = userRedis.getTicket(key);
        if(StringUtils.isEmpty(result)){
            return null;
        }
        LoginTicket t = JSON.parseObject(result, LoginTicket.class);
        return t;
    }

    public void setCurrentUser(String ticket){

    }

    public SsoUser getCurrentUser(String ticket){
        LoginTicket loginTicket = getLoginTicket(ticket);
        if(loginTicket == null){
            return null;
        }
        int userId = loginTicket.getUserId();
        if(userId <= 0){
            return null;
        }
        SsoUser user = findById(userId);
        return user;
    }

    public Boolean checkIsRoot(SsoUser user){
        if(user == null){
            return false;
        }
        List<SsoRole> roles = user.getSsoRoles();
        if(roles == null){
            return false;
        }
        Iterator iterator = roles.iterator();
        while(iterator.hasNext()){
            SsoRole role = (SsoRole) iterator.next();
            if(role.getType() == MyEnum.ROOT){
                return true;
            }
        }
        return false;

    }

    @Transactional
    public String save(SsoUser user){
        SsoUser oldUser = ssoUserRepository.findByUserName(user.getUserName());
        if(user.getId() <= 0 && oldUser.getId() > 0){
            return "新增用户名已存在!";
        }
        if(user.getId() > 0 && oldUser.getId() != user.getId()){
            return "修改用户名已存在!";
        }

        if(user.getRoleType() <= 0){
            user.setRoleType((byte)4);
        }
        user.setCreatedDate(new Date());
        user.setUpdatedDate(new Date());
        user.setIsDelete((byte)0);
        if(user.getId() <= 0 && StringUtils.isEmpty(user.getPassword())){
            String pwd = DigestUtils.md5DigestAsHex(DEFAULT_PASSWORD.getBytes());
            user.setPassword(pwd);
        }
        //注册用户
        ssoUserRepository.save(user);

        if(user.getId() <= 0){
            throw new RuntimeException();
        }
        //添加用户角色 sso_user_role
        SsoRole r = new SsoRole();
        r.setType(user.getRoleType());
        List<SsoRole> rList = new ArrayList<>();
        rList.add(r);
        user.setSsoRoles(rList);

        //根据推荐用户，添加 用户层级表 user_level
        if(user.getRecommendUserId() > 0){
            UserLevel ul = new UserLevel();
            ul.setCurrentUserId(user.getId());
            ul.setParentUserId(user.getRecommendUserId());
            ul.setCreatedDate(new Date());
            userLevelRepository.save(ul);
        }

        return "";
    }

}
