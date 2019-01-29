package com.step.train.domain.entity;

import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "sso_user_access_log")
public class SsoUserAccessLog implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private Integer userId;
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date lastLoginTime;
    private Byte failPwdCount;
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date failPwdStartTime;
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Date getLastLoginTime() {
        return lastLoginTime;
    }

    public void setLastLoginTime(Date lastLoginTime) {
        this.lastLoginTime = lastLoginTime;
    }

    public Byte getFailPwdCount() {
        return failPwdCount;
    }

    public void setFailPwdCount(Byte failPwdCount) {
        this.failPwdCount = failPwdCount;
    }

    public Date getFailPwdStartTime() {
        return failPwdStartTime;
    }

    public void setFailPwdStartTime(Date failPwdStartTime) {
        this.failPwdStartTime = failPwdStartTime;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }
}
