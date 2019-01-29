package com.step.train.domain.repository;

import com.step.train.domain.entity.SsoUserAccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SsoUserAccessLogRepository extends JpaRepository<SsoUserAccessLog, Long> {

    @Query("SELECT l FROM SsoUserAccessLog l WHERE l.userId = ?1")
    SsoUserAccessLog findByUserId(int userId);

}
