package com.step.train.service;

//import com.step.train.repository.SsoUserRepository;


/*public interface UserService extends BaseService<SsoUser> {

}*/

import com.step.train.domain.entity.SsoUser;
import com.step.train.domain.repository.SsoUserRepository;
import com.step.train.model.SsoUserQo;
import com.step.train.parameter.LinkEnum;
import com.step.train.parameter.Operator;
import com.step.train.parameter.PredicateBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    @Autowired
    private SsoUserRepository ssoUserRepository;

    public Page<SsoUser> findPage(SsoUserQo ssoUserQo){
        Pageable pageable = new PageRequest(ssoUserQo.getPage(), ssoUserQo.getSize(), new Sort(Sort.Direction.ASC, "id"));

        PredicateBuilder pb = new PredicateBuilder();

        if(!StringUtils.isEmpty(ssoUserQo.getRealName())) {
            pb.add("real_name", "%" + ssoUserQo.getRealName() + "%", LinkEnum.LIKE);
        }
        if(ssoUserQo.getStatus() >= 0){
            pb.add("status", ssoUserQo.getStatus());
        }

        pb.add("is_delete", 0);

        //return ssoUserRepository.findAll(pb.build(), Operator.AND, pageable);
        return null;

    }

    public SsoUser findByUserName(String userName){
        return ssoUserRepository.findByUserName(userName);
    }

    public SsoUser findById(int id){
        return ssoUserRepository.findById(id);
    }

}
