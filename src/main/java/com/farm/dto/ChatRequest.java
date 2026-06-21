package com.farm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    // 1️⃣ 用户 ID
    private Integer userId;

    // 2️⃣ 用户消息
    private String message;
}