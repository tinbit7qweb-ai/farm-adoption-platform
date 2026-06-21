package com.farm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TraceabilityRequest {
    // 1️⃣ 订单 ID
    private Integer orderId;

    // 2️⃣ 农事动作名称（播种、浇水、施肥等）
    private String actionName;

    // 3️⃣ 详细描述
    private String actionDetail;

    // 4️⃣ 图片 URL（可选）
    private String imageUrl;
}