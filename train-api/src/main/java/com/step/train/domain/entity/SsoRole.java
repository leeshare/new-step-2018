package com.step.train.domain.entity;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "sso_role")
public class SsoRole implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String name;
    /**
     * 1 root; 2 organization manager; 3 teacher; 4 ordinary user
     */
    private Byte type;

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

    public Byte getType() {
        return type;
    }

    public void setType(Byte type) {
        this.type = type;
    }
}
