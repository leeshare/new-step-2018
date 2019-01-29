package com.step.train.service;

import com.step.train.domain.entity.SsoOrganization;
import com.step.train.domain.repository.SsoOrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrgService {

    @Autowired
    private SsoOrganizationRepository ssoOrganizationRepository;

    public List<SsoOrganization> findAll(){
        return ssoOrganizationRepository.findAll();
    }
}
