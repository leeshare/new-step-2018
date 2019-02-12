package com.step.train.domain.repository;

import com.step.train.domain.entity.SsoUser;
import com.step.train.domain.entity.UserLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserLevelRepository
    extends JpaRepository<UserLevel, Integer>
{


}
