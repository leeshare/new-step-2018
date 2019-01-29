package com.step.train.domain.repository;

import com.step.train.domain.entity.TempRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TempRoleRepository extends JpaRepository<TempRole, Long>
{
}
