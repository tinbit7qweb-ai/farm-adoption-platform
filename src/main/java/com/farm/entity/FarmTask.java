package com.farm.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "farm_task")
public class FarmTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer taskId;

    @Column(nullable = false)
    private Integer plotId;

    private Integer orderId;

    @Column(nullable = false)
    private Integer farmerId;

    @Column(nullable = false)
    private String taskType;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private String status;

    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;
}
