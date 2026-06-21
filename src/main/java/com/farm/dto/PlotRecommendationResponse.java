package com.farm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlotRecommendationResponse {
    // 1️⃣ 地块 ID
    private Integer plotId;

    // 2️⃣ 地块编号
    private String plotNum;

    // 3️⃣ 面积
    private BigDecimal area;

    // 4️⃣ 土壤类型
    private String soilType;

    // 5️⃣ 日照时长
    private Integer sunlightHours;

    // 6️⃣ 推荐评分（1-10 分）
    private Double recommendationScore;

    // 7️⃣ 推荐理由
    private String recommendationReason;

    // 8️⃣ 农场 ID
    private Integer farmId;

    private String farmName;

    private Integer farmerId;

    private String farmerName;

    private String farmerPhone;

    private String location;
}
