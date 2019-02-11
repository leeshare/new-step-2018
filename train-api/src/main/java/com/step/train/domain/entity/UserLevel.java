package com.step.train.domain.entity;

import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import java.util.Date;

/**
 * Created by Administrator on 2/11/2019.
 * 普通用户的层级关系，————在用户注册时添加
 *      没有任何推荐人的A注册时，判断是否有 currentUser = A 的记录，有就跳过，没有就添加一条 currentUser = A, parentUser = 0 的记录
 *      比如A推荐B注册时，先判断是否有 currentUser = B 的记录，有就不添加了，没有就添加一条 currentUser = B, parentUser = A 的记录
 *      B再推荐C注册时，先判断，没有就添加一条 currentUser = C, parentUser = B 的记录
 *      A再推荐C注册时，先判断
 *
 */
@Entity
@Table(name="user_level")
public class UserLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    /**
     * 当前被推荐人
     */
    private Integer currentUserId;
    /**
     * 推荐人 或没有
     */
    private Integer parentUserId;
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdDate;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCurrentUserId() {
        return currentUserId;
    }

    public void setCurrentUserId(Integer currentUserId) {
        this.currentUserId = currentUserId;
    }

    public Integer getParentUserId() {
        return parentUserId;
    }

    public void setParentUserId(Integer parentUserId) {
        this.parentUserId = parentUserId;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }
}
