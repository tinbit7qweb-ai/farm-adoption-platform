package com.farm.controller;

import com.farm.dto.AdoptionRequest;
import com.farm.dto.AdoptionOrderResponse;
import com.farm.dto.ApiResponse;
import com.farm.entity.AdoptionOrder;
import com.farm.service.AdoptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/adoption")
@CrossOrigin(origins = "*")
public class AdoptionController {
    @Autowired
    private AdoptionService adoptionService;

    // 1️⃣ 【POST /api/adoption/adopt】用户认养地块（核心业务！）
    @PostMapping("/adopt")
    public ApiResponse<AdoptionOrder> adoptPlot(@RequestBody AdoptionRequest request) {
        try {
            AdoptionOrder order = adoptionService.adoptPlot(
                    request.getUserId(),
                    request.getPlotId(),
                    request.getCropId(),
                    request.getDurationMonths()
            );
            return ApiResponse.success("地块认养成功！系统已自动启动溯源监控", order);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 2️⃣ 【GET /api/adoption/active/{userId}】获取用户的活跃订单
    @GetMapping("/active/{userId}")
    public ApiResponse<List<AdoptionOrderResponse>> getUserActiveOrders(@PathVariable Integer userId) {
        try {
            List<AdoptionOrderResponse> orders = adoptionService.getUserActiveOrderDetails(userId);
            return ApiResponse.success("获取成功", orders);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 3️⃣ 【GET /api/adoption/history/{userId}】获取用户的历史订单
    @GetMapping("/history/{userId}")
    public ApiResponse<List<AdoptionOrderResponse>> getUserHistoryOrders(@PathVariable Integer userId) {
        try {
            List<AdoptionOrderResponse> orders = adoptionService.getUserHistoryOrderDetails(userId);
            return ApiResponse.success("获取成功", orders);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 4️⃣ 【GET /api/adoption/order/{orderId}】获取订单详情
    @GetMapping("/order/{orderId}")
    public ApiResponse<AdoptionOrderResponse> getOrderDetail(@PathVariable Integer orderId) {
        try {
            AdoptionOrderResponse order = adoptionService.getOrderDetailResponse(orderId);
            return ApiResponse.success(order);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 5️⃣ 【POST /api/adoption/cancel/{orderId}】取消认养
    @PostMapping("/cancel/{orderId}")
    public ApiResponse<String> cancelAdoption(@PathVariable Integer orderId) {
        try {
            adoptionService.cancelAdoption(orderId);
            return ApiResponse.success("认养已取消，地块已释放");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 6️⃣ 【POST /api/adoption/complete/{orderId}】完成认养
    @PostMapping("/complete/{orderId}")
    public ApiResponse<String> completeAdoption(@PathVariable Integer orderId) {
        try {
            adoptionService.completeAdoption(orderId);
            return ApiResponse.success("认养已完成");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
