package com.step.repository;

import com.step.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Created by Administrator on 12/3/2018.
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
