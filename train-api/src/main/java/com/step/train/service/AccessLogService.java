package com.step.train.service;

import com.step.train.domain.entity.SsoUserAccessLog;
import com.step.train.domain.repository.SsoUserAccessLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

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

    /**
     * 用户登录 查询/保存
     * @param userId    用户Id
     * @param isPass    是否当前验证通过
     * @param isSetLog  是查询还是设置
     * @return
     */
    public int checkAccessLog(Integer userId, Boolean isPass, Boolean isSetLog){
        int result = 0;
        Byte errorNum = 0;
        SsoUserAccessLog log = findByUserId(userId);
        if(log != null && log.getId() > 0){
            errorNum = log.getFailPwdCount();
            Date _now = new Date();
            if(log.getFailPwdCount() > 5){
                log.setFailPwdCount((byte)(errorNum + 1));
                if(_now.getTime() - log.getFailPwdStartTime().getTime() > 1000 * 60 * 60){
                    //已超过5次，但距离上次错误已过了1小时了
                    result = errorNum;
                }else {
                    log.setFailPwdStartTime(_now);
                    //密码错误超过5次，距离上次失败不到一小时，请稍后再试
                    result = -3;
                }
            }else {
                result = errorNum; //未超过5次，可以继续尝试
                //log.setFailPwdCount((byte)(errorNum + 1));
                //log.setFailPwdStartTime(_now);
            }
            if(isSetLog && result >= 0){
                if(isPass){
                    log.setFailPwdCount((byte)0);
                    log.setLastLoginTime(_now);
                    result = 0;
                }else {
                    log.setFailPwdCount((byte)(errorNum + 1));
                    log.setFailPwdStartTime(_now);
                    result = errorNum + 1; //未超过5次，可以继续尝试
                }
                saveLog(log);
            }
        }else {
            if (isSetLog) {
                log = new SsoUserAccessLog();
                Date _now = new Date();
                log.setUserId(userId);
                log.setCreatedDate(_now);
                if (isPass) {
                    log.setFailPwdCount((byte) 0);
                    log.setLastLoginTime(_now);
                    result = 0;
                } else {
                    log.setFailPwdCount(errorNum);
                    log.setFailPwdStartTime(_now);
                    result = 1; //未超过5次，可以继续尝试
                }
                saveLog(log);
            }else {
                result = 0;
            }
        }
        return result;
    }

}
