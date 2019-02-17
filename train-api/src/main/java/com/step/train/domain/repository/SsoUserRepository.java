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

    @Query(nativeQuery = true, value = "SELECT COUNT(*) FROM sso_user u WHERE u.is_delete = 0 AND (u.role_type = ?1 OR 0 = ?1) AND (u.status = ?2 OR -1 = ?2) AND (u.real_name LIKE CONCAT(CONCAT('%',?3),'%') OR u.user_name LIKE CONCAT(CONCAT('%',?3),'%')) AND (u.org_id = ?4 OR 0 = ?4)  ")
    int findCount(byte roleType, byte status, String keyword, int orgId);

    //@Query("SELECT u FROM SsoUser u WHERE u.isDelete = 0 AND (u.roleType = ?1 OR 0 = ?1)")
    //List<SsoUser> find(byte roleType);
    @Query(nativeQuery = true, value = "SELECT u.* FROM sso_user u WHERE u.is_delete = 0 AND (u.role_type = ?3 OR 0 = ?3) AND (u.status = ?4 OR -1 = ?4) AND (u.real_name LIKE CONCAT(CONCAT('%',?5),'%') OR u.user_name LIKE CONCAT(CONCAT('%',?5),'%')) AND (u.org_id = ?6 OR 0 = ?6) LIMIT ?2 OFFSET ?1 ")
    List<SsoUser> find(int offset, int limit, byte roleType, byte status, String keyword, int orgId);

    @Query("SELECT u FROM SsoUser u WHERE u.isDelete = 0 AND u.wechatOpenId = ?1")
    SsoUser findByWechatOpenId(String openId);
}
