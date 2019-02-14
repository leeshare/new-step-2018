package com.step.train.domain.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "course")
public class Course implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String name;

    private Integer orgId;

    //@ManyToOne
    //@JoinColumn(name = "org_id")
    //@JsonBackReference
    //private SsoOrganization ssoOrganization;

    private Integer teacherId;

    /**
     * 1 收费 2 免费
     */
    private Byte courseType;

    @Column(nullable = true, columnDefinition = "decimal(11,2)")
    private BigDecimal price;

    private String courseDesc;

    private String coursePhoto;

    /**
     * 1 显示在前端； 0 隐藏
     */
    private Byte isShow;

    /**
     * 1 启用；0 停用
     */
    private Byte status;

    /**
     * 0 正常； 1 删除
     */
    private Byte isDelete;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdDate;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updatedDate;

    private Integer createdUserId;

    private Integer updatedUserId;

    @Transient
    private String createdUserName;
    @Transient
    private String updatedUserName;
    //private Timestamp lastModify;

    @Transient
    private String orgName;

    //-------------------------------------//

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    /*public Integer getOrgId() {
        return orgId;
    }

    public void setOrgId(Integer orgId) {
        this.orgId = orgId;
    }*/

    public Integer getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Integer teacherId) {
        this.teacherId = teacherId;
    }

    public Byte getCourseType() {
        return courseType;
    }

    public void setCourseType(Byte courseType) {
        this.courseType = courseType;
    }

    public String getCourseDesc() {
        return courseDesc;
    }

    public void setCourseDesc(String courseDesc) {
        this.courseDesc = courseDesc;
    }

    public String getCoursePhoto() {
        return coursePhoto;
    }

    public void setCoursePhoto(String coursePhoto) {
        this.coursePhoto = coursePhoto;
    }

    public Byte getIsShow() {
        return isShow;
    }

    public void setIsShow(Byte isShow) {
        this.isShow = isShow;
    }

    public Byte getStatus() {
        return status;
    }

    public void setStatus(Byte status) {
        this.status = status;
    }

    public Byte getIsDelete() {
        return isDelete;
    }

    public void setIsDelete(Byte isDelete) {
        this.isDelete = isDelete;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public Date getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(Date updatedDate) {
        this.updatedDate = updatedDate;
    }

    public Integer getCreatedUserId() {
        return createdUserId;
    }

    public void setCreatedUserId(Integer createdUserId) {
        this.createdUserId = createdUserId;
    }

    public Integer getUpdatedUserId() {
        return updatedUserId;
    }

    public void setUpdatedUserId(Integer updatedUserId) {
        this.updatedUserId = updatedUserId;
    }

    /*public SsoOrganization getSsoOrganization() {
        return ssoOrganization;
    }

    public void setSsoOrganization(SsoOrganization ssoOrganization) {
        this.ssoOrganization = ssoOrganization;
    }*/

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCreatedUserName() {
        return createdUserName;
    }

    public void setCreatedUserName(String createdUserName) {
        this.createdUserName = createdUserName;
    }

    public String getUpdatedUserName() {
        return updatedUserName;
    }

    public void setUpdatedUserName(String updatedUserName) {
        this.updatedUserName = updatedUserName;
    }

    public Integer getOrgId() {
        return orgId;
    }

    public void setOrgId(Integer orgId) {
        this.orgId = orgId;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }
}
