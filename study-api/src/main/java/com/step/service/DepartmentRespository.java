package com.step.service;

import com.step.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Created by Administrator on 12/3/2018.
 */
@Repository
public interface DepartmentRespository extends JpaRepository<Department, Long> {
}
