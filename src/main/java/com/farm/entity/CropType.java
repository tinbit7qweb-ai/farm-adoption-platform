package com.farm.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "crop_type")
public class CropType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cropId;

    @Column(nullable = false, unique = true)
    private String cropName;

    @Column(columnDefinition = "ENUM('蔬菜', '水果', '花卉')")
    private String category;

    private Integer growthDays;

    private String waterRequirement;

    private String temperatureRange;

    private String description;
}