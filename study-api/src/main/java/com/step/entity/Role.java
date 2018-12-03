package com.step.entity;

import org.springframework.data.annotation.Id;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.io.Serializable;

/**
 * Created by Administrator on 12/3/2018.
 */
@Entity
@Table(name="role")
public class Role implements Serializable {
    @Id
    private Long id;
    private String name;

    public Role(){

    }

    public void setId(Long id){
        this.id = id;
    }
    public Long getId(){
        return id;
    }
    public void setName(String name){
        this.name = name;
    }
    public String getName(){
        return name;
    }

}
