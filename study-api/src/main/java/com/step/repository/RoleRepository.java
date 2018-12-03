package com.step.repository;

import com.step.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Created by Administrator on 12/3/2018.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
}
