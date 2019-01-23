package com.step.train.domain.entity;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "fee_order")
public class FeeOrder implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
