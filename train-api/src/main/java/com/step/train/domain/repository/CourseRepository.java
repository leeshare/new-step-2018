package com.step.train.domain.repository;

import com.step.train.domain.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by Administrator on 2/13/2019.
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    @Query("SELECT u FROM Course u WHERE u.isDelete = 0 AND u.id = ?1")
    Course findById(int id);

    @Query("SELECT o FROM Course o WHERE o.isDelete = 0 AND o.name = ?1 AND o.id <> ?2")
    List<Course> findByName(String name, Integer id);

    @Query(nativeQuery = true, value = "SELECT COUNT(*) FROM course u WHERE u.is_delete = 0 AND (u.status = ?1 OR -1 = ?1) AND (u.name LIKE CONCAT(CONCAT('%',?2),'%') ) ")
    int findCount(byte status, String keyword);

    @Query(nativeQuery = true, value = "SELECT u.* FROM course u WHERE u.is_delete = 0 AND (u.status = ?3 OR -1 = ?3) AND (u.name LIKE CONCAT(CONCAT('%',?4),'%') ) LIMIT ?2 OFFSET ?1 ")
    List<Course> find(int offset, int limit, byte status, String keyword);
}
