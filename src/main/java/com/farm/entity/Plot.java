package com.farm.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "plot")
public class Plot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer plotId;

    @Column(nullable = false, unique = true)
    private String plotNum;

    private BigDecimal area;

    @Column(nullable = false)
    private Integer status; // 0-待认养, 1-认养中, 2-已完成

    @Column(nullable = false)
    private Integer farmId;

    private String soilType;

    private Integer sunlightHours;

    @Column(columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}