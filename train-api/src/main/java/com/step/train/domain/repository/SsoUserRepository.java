package com.step.train.domain.repository;

import com.step.train.domain.entity.SsoUser;
import com.step.train.parameter.Operator;
import com.step.train.parameter.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SsoUserRepository
        //extends ExpandJpaRepository<SsoUser, Integer>
    extends JpaRepository<SsoUser, Integer>
{

    @Query("SELECT u FROM SsoUser u WHERE u.isDelete = 0 AND u.userName = ?1")
    SsoUser findByUserName(String userName);

    @Query("SELECT u FROM SsoUser u WHERE u.isDelete = 0 AND u.status = 1 AND u.realName like :name")
    Page<SsoUser> findByRealName(@Param("name") String name, Pageable pageRequest);

    @Query("SELECT u FROM SsoUser u WHERE u.isDelete = 0 AND u.id = ?1")
    SsoUser findById(int id);

    @Query("SELECT u FROM SsoUser u WHERE u.isDelete = 0 AND (u.roleType = ?1 OR 0 = ?1)")
    List<SsoUser> find(int roleType);

}
