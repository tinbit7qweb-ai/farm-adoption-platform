package com.farm.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Integer userId;
    private String userName;
    private String orderId;
    private String traceCode;
    private String plotNum;
    private String farmName;
    private String crop;
    private Integer rating;
    private String content;
}
