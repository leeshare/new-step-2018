package com.step.repository;

import com.step.entity.User2;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Created by Administrator on 12/19/2018.
 */
public interface User2Mongodb extends MongoRepository<User2, String> {
    User2 findByUsername(String username);
}
