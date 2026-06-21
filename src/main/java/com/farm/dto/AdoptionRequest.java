package com.farm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdoptionRequest {
    // 1️⃣ 用户 ID
    private Integer userId;

    // 2️⃣ 地块 ID
    private Integer plotId;

    // 3️⃣ 作物 ID
    private Integer cropId;

    // 4️⃣ 认养时长（月数）
    private Integer durationMonths;
}