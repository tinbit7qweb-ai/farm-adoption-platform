package com.farm.controller;

import com.farm.dto.TraceabilityRequest;
import com.farm.dto.ApiResponse;
import com.farm.entity.TraceabilityRecord;
import com.farm.service.TraceabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/traceability")
@CrossOrigin(origins = "*")
public class TraceabilityController {
    @Autowired
    private TraceabilityService traceabilityService;

    // 1️⃣ 【GET /api/traceability/order/{orderId}】获取订单的所有溯源记录
    @GetMapping("/order/{orderId}")
    public ApiResponse<List<TraceabilityRecord>> getOrderTraceability(@PathVariable Integer orderId) {
        try {
            List<TraceabilityRecord> records = traceabilityService.getOrderTraceability(orderId);
            return ApiResponse.success("获取成功", records);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 2️⃣ 【POST /api/traceability/add】添加溯源记录（农场主操作）
    @PostMapping("/add")
    public ApiResponse<TraceabilityRecord> addTraceabilityRecord(@RequestBody TraceabilityRequest request) {
        try {
            TraceabilityRecord record = traceabilityService.addTraceabilityRecord(
                    request.getOrderId(),
                    request.getActionName(),
                    request.getActionDetail(),
                    request.getImageUrl()
            );
            return ApiResponse.success("溯源记录添加成功！", record);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 3️⃣ 【GET /api/traceability/latest/{orderId}】获取最新的溯源记录
    @GetMapping("/latest/{orderId}")
    public ApiResponse<TraceabilityRecord> getLatestRecord(@PathVariable Integer orderId) {
        try {
            TraceabilityRecord record = traceabilityService.getLatestRecord(orderId);
            if (record == null) {
                return ApiResponse.error("暂无溯源记录");
            }
            return ApiResponse.success(record);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 4️⃣ 【GET /api/traceability/report/{orderId}】生成溯源报告
    @GetMapping("/report/{orderId}")
    public ApiResponse<String> generateTraceabilityReport(@PathVariable Integer orderId) {
        try {
            String report = traceabilityService.generateTraceabilityReport(orderId);
            return ApiResponse.success(report);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 5️⃣ 【GET /api/traceability/action/{actionName}】查询特定农事动作
    @GetMapping("/action/{actionName}")
    public ApiResponse<List<TraceabilityRecord>> getRecordsByActionName(@PathVariable String actionName) {
        try {
            List<TraceabilityRecord> records = traceabilityService.getRecordsByActionName(actionName);
            return ApiResponse.success(records);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}