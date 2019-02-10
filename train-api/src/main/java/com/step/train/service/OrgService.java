package com.step.train.service;

import com.step.train.domain.entity.SsoOrganization;
import com.step.train.domain.repository.SsoOrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.List;

@Service
public class OrgService {

    @Autowired
    private SsoOrganizationRepository ssoOrganizationRepository;

    public List<SsoOrganization> findAll(){
        return ssoOrganizationRepository.findAll();
    }

    public List<SsoOrganization> findByName(String name, int orgId){
        return ssoOrganizationRepository.findByName(name, orgId);
    }

    public SsoOrganization findDefaultOrg(){
        return ssoOrganizationRepository.findDefaultOrg();
    }

    @Transactional
    public String save(SsoOrganization org){
        if(StringUtils.isEmpty(org.getName())){
            return "请输入机构名称";
        }
        //机构名称不重复
        List<SsoOrganization> orgs = findByName(org.getName(), org.getId());
        if(orgs.size() > 0){
            return "机构名称重复";
        }
         if(org.getId() <= 0) {
            org.setCreatedUserId(org.getUpdatedUserId());
            org.setCreatedDate(new Date());
        }
        //默认机构只能有一个
        if(org.getIsDefaultOrg() == 1){
            SsoOrganization defaultOrg = findDefaultOrg();
            if(defaultOrg != null && defaultOrg.getId() != org.getId()){
                Byte d = 0;
                defaultOrg.setIsDefaultOrg(d);
                defaultOrg.setUpdatedUserId(org.getUpdatedUserId());
                defaultOrg.setUpdatedDate(new Date());
                ssoOrganizationRepository.save(defaultOrg);
            }
        }
        org.setIsDelete((byte)0);
        org.setUpdatedDate(new Date());
        ssoOrganizationRepository.save(org);
        return "";
    }

}
