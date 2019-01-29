package com.step.train;

import com.step.train.domain.entity.TempDepartment;
import com.step.train.domain.entity.TempRole;
import com.step.train.domain.entity.TempUser;
import com.step.train.domain.repository.TempDepartmentRepository;
import com.step.train.domain.repository.TempRoleRepository;
import com.step.train.domain.repository.TempUserRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.util.Assert;

import java.util.Date;
import java.util.List;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {JpaConfiguration.class})
public class MysqlTest {

    private static Logger logger = LoggerFactory.getLogger(MysqlTest.class);

    @Autowired
    TempUserRepository tempUserRepository;
    @Autowired
    TempDepartmentRepository tempDepartmentRepository;
    @Autowired
    TempRoleRepository tempRoleRepository;

    @Before
    public void initData(){
        tempUserRepository.deleteAll();
        tempRoleRepository.deleteAll();
        tempDepartmentRepository.deleteAll();

        TempDepartment tempDepartment = new TempDepartment();
        tempDepartment.setName("开发部");
        tempDepartmentRepository.save(tempDepartment);
        Assert.notNull(tempDepartment.getId());

        TempRole tempRole = new TempRole();
        tempRole.setName("admin");
        tempRoleRepository.save(tempRole);
        Assert.notNull(tempRole.getId());

        TempUser tempUser = new TempUser();
        tempUser.setName("小丽");
        tempUser.setCreatedata(new Date());
        tempUser.setTempDepartment(tempDepartment);

        List<TempRole> tempRoles = tempRoleRepository.findAll();
        Assert.notNull(tempRole);
        tempUser.setTempRoles(tempRoles);

        tempUserRepository.save(tempUser);
        Assert.notNull(tempUser.getId());
    }

    @Test
    public void findPage(){
        Pageable pageable = new PageRequest(0, 10, new Sort(Sort.Direction.ASC, "id"));
        Page<TempUser> page = tempUserRepository.findAll(pageable);
        Assert.notNull(page);
        for(TempUser tempUser: page.getContent()) {
            logger.info("=====tempUser===== user name:{}, department name: {}, role name: {}", tempUser.getName(), tempUser.getTempDepartment().getName(), tempUser.getTempRoles().get(0).getName());
        }

    }

}
