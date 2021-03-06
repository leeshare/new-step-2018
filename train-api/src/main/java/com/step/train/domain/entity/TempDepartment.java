package com.step.train.domain.entity;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Created by Administrator on 12/3/2018.
 */
@Entity
@Table(name = "temp_department")
public class TempDepartment implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    public TempDepartment(){

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
