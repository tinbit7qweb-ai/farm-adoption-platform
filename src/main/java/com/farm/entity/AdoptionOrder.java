package com.farm.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "adoption_order")
public class AdoptionOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderId;

    @Column(nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private Integer plotId;

    private Integer cropId;

    // 新增认养时长映射数据库duration_months
    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;

    @Column(columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createTime;

    private LocalDateTime endDate;

    @Column(columnDefinition = "ENUM('active', 'completed', 'cancelled')")
    private String status;

    @Column(name = "payment_status")
    private String paymentStatus;
}
