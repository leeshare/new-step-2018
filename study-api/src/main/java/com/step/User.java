package com.step;

import java.math.BigDecimal;

/**
 * Created by lxl on 18/12/3.
 */
public class User {
    private BigDecimal id;
    private String userName;
    private String sex;

    public BigDecimal getId(){
        return id;
    }
    public void setId(BigDecimal id){
        this.id = id;
    }
    public String getUserName(){
        return userName;
    }
    public void setUserName(String userName){
        this.userName = userName;
    }
    public String getSex(){
        return sex;
    }
    public void setSex(String sex){
        this.sex = sex;
    }
}
