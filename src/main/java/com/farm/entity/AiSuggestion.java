package com.farm.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ai_suggestion")
public class AiSuggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer suggestionId;

    @Column(nullable = false)
    private Integer orderId;

    private Integer cropId;

    private String suggestionText;

    @Column(columnDefinition = "ENUM('种植建议', '预测', '防病防虫')")
    private String suggestionType;

    @Column(columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}