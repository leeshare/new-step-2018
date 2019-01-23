package com.step.train.domain.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * Created by Administrator on 12/3/2018.
 */
@Entity
@Table(name = "temp_user")
public class TempUser implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdata;

    @ManyToOne
    @JoinColumn(name = "did")
    @JsonBackReference
    private TempDepartment tempDepartment;

    @ManyToMany(cascade = {}, fetch = FetchType.EAGER)
    @JoinTable(name = "temp_user_role", joinColumns = {@JoinColumn(name = "user_id")}, inverseJoinColumns = {@JoinColumn(name = "role_id")})
    private List<TempRole> tempRoles;

    public TempUser(){

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
    public void setCreatedata(Date createdata){
        this.createdata = createdata;
    }
    public Date getCreatedata(){
        return createdata;
    }
    public TempDepartment getTempDepartment(){
        return tempDepartment;
    }
    public void setTempDepartment(TempDepartment tempDepartment){
        this.tempDepartment = tempDepartment;
    }
    public List<TempRole> getTempRoles(){
        return tempRoles;
    }
    public void setTempRoles(List<TempRole> tempRoles){
        this.tempRoles = tempRoles;
    }
}
