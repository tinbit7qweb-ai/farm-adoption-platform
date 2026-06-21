package com.farm.dto;

import lombok.Data;

@Data
public class FarmChatRequest {
    private Integer plotId;
    private Integer orderId;
    private Integer userId;
    private Integer farmerId;
    private String senderRole;
    private String content;
}
