package com.step.train.domain.entity;

import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "fee_order")
public class FeeOrder implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String code;

    private String name;

    @Column(nullable = true, columnDefinition = "decimal(11,2)")
    private BigDecimal money;

    /**
     * 0 待支付
     * 1 已支付
     * 2 支付失败
     * 3 取消支付
     */
    private Byte status;

    /**
     * 0 正常 1 删除
     */
    private Byte isDelete;

    private Integer courseId;

    private String courseName;

    private Integer buyer;

    private String buyerName;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdDate;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updatedDate;

    private Integer createdUserId;

    private Integer updatedUserId;

    private String remark;

    private String clientIp;

    private String clientMachine;

    private Byte payedType;

    private String tradeNo;

    private Date payedTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
