package com.farm.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class FarmTaskRequest {
    private Integer plotId;
    private Integer orderId;
    private Integer farmerId;
    private String taskType;
    private LocalDate dueDate;
    private String note;
}
