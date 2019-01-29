package com.step.train.domain.repository;

import com.step.train.domain.entity.TempDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TempDepartmentRepository extends JpaRepository<TempDepartment, Long>
{
}
