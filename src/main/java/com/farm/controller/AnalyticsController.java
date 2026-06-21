package com.farm.controller;

import com.farm.dto.ApiResponse;
import com.farm.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {
    @Autowired
    private AnalyticsService analyticsService;

    // 1️⃣ 【GET /api/analytics/farm-overview】农场概览统计
    @GetMapping("/farm-overview")
    public ApiResponse<Map<String, Object>> getFarmOverviewStats() {
        try {
            Map<String, Object> stats = analyticsService.getFarmOverviewStats();
            return ApiResponse.success("农场概览数据获取成功", stats);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 2️⃣ 【GET /api/analytics/user-behavior/{userId}】用户行为分析
    @GetMapping("/user-behavior/{userId}")
    public ApiResponse<Map<String, Object>> getUserBehaviorAnalysis(@PathVariable Integer userId) {
        try {
            Map<String, Object> analysis = analyticsService.getUserBehaviorAnalysis(userId);
            return ApiResponse.success("用户行为分析完成", analysis);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 3️⃣ 【GET /api/analytics/crop-popularity】作物流行度排行
    @GetMapping("/crop-popularity")
    public ApiResponse<List<Map<String, Object>>> getCropPopularityRanking() {
        try {
            List<Map<String, Object>> ranking = analyticsService.getCropPopularityRanking();
            return ApiResponse.success("作物流行度排行获取成功", ranking);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 4️⃣ 【GET /api/analytics/soil-distribution】土壤分布分析
    @GetMapping("/soil-distribution")
    public ApiResponse<Map<String, Long>> getSoilDistribution() {
        try {
            Map<String, Long> distribution = analyticsService.getSoilDistribution();
            return ApiResponse.success("土壤分布数据获取成功", distribution);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 5️⃣ 【GET /api/analytics/sunlight-distribution】日照分布分析
    @GetMapping("/sunlight-distribution")
    public ApiResponse<Map<String, Long>> getSunlightDistribution() {
        try {
            Map<String, Long> distribution = analyticsService.getSunlightDistribution();
            return ApiResponse.success("日照分布数据获取成功", distribution);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 6️⃣ 【GET /api/analytics/user-revenue/{userId}】用户收益预测
    @GetMapping("/user-revenue/{userId}")
    public ApiResponse<Map<String, Object>> predictUserRevenue(@PathVariable Integer userId) {
        try {
            Map<String, Object> prediction = analyticsService.predictUserRevenue(userId);
            return ApiResponse.success("收益预测完成", prediction);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 7️⃣ 【GET /api/analytics/traceability-stats】溯源统计
    @GetMapping("/traceability-stats")
    public ApiResponse<Map<String, Object>> getTraceabilityStats() {
        try {
            Map<String, Object> stats = analyticsService.getTraceabilityStats();
            return ApiResponse.success("溯源统计获取成功", stats);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 8️⃣ 【GET /api/analytics/monthly-report/{userId}】月度报告
    @GetMapping("/monthly-report/{userId}")
    public ApiResponse<Map<String, Object>> generateMonthlyReport(
            @PathVariable Integer userId,
            @RequestParam int month,
            @RequestParam int year) {
        try {
            Map<String, Object> report = analyticsService.generateMonthlyReport(userId, month, year);
            return ApiResponse.success("月度报告生成成功", report);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 9️⃣ 【GET /api/analytics/adoption-trends】认养趋势分析
    @GetMapping("/adoption-trends")
    public ApiResponse<List<Map<String, Object>>> getAdoptionTrends() {
        try {
            List<Map<String, Object>> trends = analyticsService.getAdoptionTrends();
            return ApiResponse.success("认养趋势分析完成", trends);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}