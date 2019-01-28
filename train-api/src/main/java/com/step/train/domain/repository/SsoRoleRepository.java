package com.step.train.domain.repository;

import com.step.train.domain.entity.SsoRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SsoRoleRepository extends JpaRepository<SsoRole, Integer> {

    //@Query("SELECT DISTINCT r FROM SsoRole r, SsoUserRole ur WHERE ur.roleId = r.id AND ur.userId = ?1")
    @Query(nativeQuery = true, value = "SELECT DISTINCT r.* FROM sso_role r, sso_user_role ur WHERE ur.role_id = r.id AND ur.user_id = ?1")
    List<SsoRole> findRolesByUser(int userId);
}
