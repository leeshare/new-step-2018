package com.step.train.domain.repository;

import com.step.train.domain.entity.SsoOrganization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SsoOrganizationRepository extends JpaRepository<SsoOrganization, Integer> {

    @Query("SELECT o FROM SsoOrganization o WHERE o.isDelete = 0")
    List<SsoOrganization> findAll();

}
