package com.farm.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdoptionOrderResponse {
    private Integer orderId;
    private Integer userId;
    private Integer plotId;
    private String plotNum;
    private String title;
    private Integer cropId;
    private Integer durationMonths;
    private LocalDateTime createTime;
    private LocalDateTime endDate;
    private String status;
    private String paymentStatus;
    private Integer farmId;
    private String farmName;
    private String location;
    private Integer farmerId;
    private String farmerName;
    private String farmerPhone;
    private String crop;
}
