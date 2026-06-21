package com.farm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiSuggestionRequest {
    // 1️⃣ 作物 ID
    private Integer cropId;

    // 2️⃣ 土壤类型
    private String soilType;

    // 3️⃣ 日照时长（小时）
    private Integer sunlightHours;

    // 4️⃣ 已种植天数（用于预测）
    private Integer daysGrown;

    // 5️⃣ 季节（春、夏、秋、冬）
    private String season;

    // 6️⃣ 建议类型（种植建议、预测、防病防虫）
    private String suggestionType;
}