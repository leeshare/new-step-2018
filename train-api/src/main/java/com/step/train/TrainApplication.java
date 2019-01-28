package com.step.train;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication  //就包含了下面的 ComponentScan, 等
//@ComponentScan(basePackages = "com.step.train")   //扫描 @Controller、@Service 注解
//@EnableJpaRepositories(basePackages = "com.step.train")     //扫描 @Repository 注解
//@EntityScan(basePackages = "com.step.train")    //扫描 @Entity 注解

@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 3600)
public class TrainApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrainApplication.class, args);
    }

}

