package com.step.train.service;

import com.step.train.domain.entity.SsoUserAccessLog;
import com.step.train.domain.repository.SsoUserAccessLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AccessLogService {
    @Autowired
    private SsoUserAccessLogRepository accessLogRepository;

    public SsoUserAccessLog saveLog(SsoUserAccessLog log){
        return accessLogRepository.save(log);
    }

    public SsoUserAccessLog findByUserId(int userId){
        return accessLogRepository.findByUserId(userId);
    }
}
