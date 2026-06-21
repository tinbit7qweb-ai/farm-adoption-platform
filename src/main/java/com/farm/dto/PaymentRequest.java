package com.farm.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Integer orderId;
    private Integer userId;
    private BigDecimal amount;
    private String paymentMethod;
}
