package com.step.train.domain.repository;

import com.step.train.domain.entity.TempUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 用户实体User使用JPA进行持久化
 * 使用@Repository将此接口定义为一个资源库，使它能被其他程序引用，并为其他程序提供存取数据库的功能。
 * Created by Administrator on 12/3/2018.
 */
@Repository
public interface TempUserRepository extends JpaRepository<TempUser, Long>
{
}
