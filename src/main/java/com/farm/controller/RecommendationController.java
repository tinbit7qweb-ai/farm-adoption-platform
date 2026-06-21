package com.farm.controller;

import com.farm.dto.ApiResponse;
import com.farm.entity.Plot;
import com.farm.entity.CropType;
import com.farm.entity.AdoptionOrder;
import com.farm.service.PlotService;
import com.farm.service.CropService;
import com.farm.service.AdoptionService;
import com.farm.service.AuthService;
import com.farm.util.RecommendationEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/recommendation")
@CrossOrigin(origins = "*")
public class RecommendationController {
    @Autowired
    private PlotService plotService;

    @Autowired
    private CropService cropService;

    @Autowired
    private AdoptionService adoptionService;

    @Autowired
    private AuthService authService;

    // 1️⃣ 【GET /api/recommendation/personalized/{userId}】个性化推荐
    @GetMapping("/personalized/{userId}")
    public ApiResponse<Map<String, Object>> getPersonalizedRecommendation(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "5") Integer limit,
            @RequestParam(required = false) Integer targetCropId) {
        try {
            // 获取用户信息
            var user = authService.getUserById(userId);

            // 获取用户历史
            List<AdoptionOrder> userHistory = adoptionService.getUserActiveOrders(userId);

            // 获取所有地块
            List<Plot> availablePlots = plotService.getAvailablePlots();

            // 获取目标作物（可选）
            CropType targetCrop = null;
            if (targetCropId != null) {
                targetCrop = cropService.getCropDetail(targetCropId);
            }

            // 获取所有订单（用于热度计算）
            // 注：实际应该从 repository 获取，这里简化处理
            List<AdoptionOrder> allOrders = new ArrayList<>();

            // 计算推荐
            List<Map<String, Object>> recommendations = RecommendationEngine
                    .getRecommendedPlotsForUser(
                            availablePlots,
                            userHistory,
                            user.getRole(),
                            targetCrop,
                            allOrders,
                            limit
                    );

            Map<String, Object> result = new HashMap<>();
            result.put("recommendations", recommendations);
            result.put("userRole", user.getRole());
            result.put("userExperienceLevel", userHistory.size() == 0 ? "新手" : "老手");

            return ApiResponse.success("个性化推荐生成成功", result);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 2️⃣ 【POST /api/recommendation/quality-score】计算单个地块的质量评分
    @PostMapping("/quality-score")
    public ApiResponse<Map<String, Object>> calculateQualityScore(@RequestParam Integer plotId) {
        try {
            Plot plot = plotService.getPlotDetail(plotId);
            Double score = RecommendationEngine.calculatePlotQualityScore(plot);

            Map<String, Object> result = new HashMap<>();
            result.put("plotId", plotId);
            result.put("plotNum", plot.getPlotNum());
            result.put("qualityScore", score);
            result.put("evaluation", score >= 8 ? "优秀" : score >= 6 ? "良好" : "一般");

            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 3️⃣ 【GET /api/recommendation/by-crop/{cropId}】按作物类型推荐地块
    @GetMapping("/by-crop/{cropId}")
    public ApiResponse<Map<String, Object>> recommendPlotsByCrop(
            @PathVariable Integer cropId,
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            CropType crop = cropService.getCropDetail(cropId);
            List<Plot> allPlots = plotService.getAvailablePlots();

            // 过滤出最适合这个作物的地块
            List<Map<String, Object>> recommendations = allPlots.stream()
                    .limit(limit)
                    .map(plot -> {
                        Double score = RecommendationEngine.calculatePlotQualityScore(plot);

                        Map<String, Object> item = new HashMap<>();
                        item.put("plot", plot);
                        item.put("score", score);
                        item.put("suitability", getSuitabilityForCrop(plot, crop));

                        return item;
                    })
                    .sorted((a, b) -> Double.compare(
                            (Double) b.get("score"),
                            (Double) a.get("score")
                    ))
                    .collect(java.util.stream.Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("crop", crop);
            result.put("recommendations", recommendations);

            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 4️⃣ 【GET /api/recommendation/by-level/{level}】按经验等级推荐
    @GetMapping("/by-level/{level}")
    public ApiResponse<List<Map<String, Object>>> recommendPlotsByLevel(
            @PathVariable String level, // beginner, intermediate, advanced
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            List<Plot> allPlots = plotService.getAvailablePlots();

            List<Map<String, Object>> recommendations = allPlots.stream()
                    .filter(plot -> matchesLevel(plot, level))
                    .limit(limit)
                    .map(plot -> {
                        Double score = RecommendationEngine.calculatePlotQualityScore(plot);

                        Map<String, Object> item = new HashMap<>();
                        item.put("plot", plot);
                        item.put("score", score);
                        item.put("levelReason", getLevelReason(plot, level));

                        return item;
                    })
                    .collect(java.util.stream.Collectors.toList());

            return ApiResponse.success("按经验等级推荐成功", recommendations);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 5️⃣ 【GET /api/recommendation/trending】热门地块排行
    @GetMapping("/trending")
    public ApiResponse<List<Map<String, Object>>> getTrendingPlots(
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            List<Plot> allPlots = plotService.getAvailablePlots();

            List<Map<String, Object>> trending = allPlots.stream()
                    .limit(limit)
                    .map(plot -> {
                        Double score = RecommendationEngine.calculatePlotQualityScore(plot);

                        Map<String, Object> item = new HashMap<>();
                        item.put("plot", plot);
                        item.put("score", score);
                        item.put("trend", "📈 上升中"); // 简化处理

                        return item;
                    })
                    .sorted((a, b) -> Double.compare(
                            (Double) b.get("score"),
                            (Double) a.get("score")
                    ))
                    .collect(java.util.stream.Collectors.toList());

            return ApiResponse.success("热门地块获取成功", trending);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // ========== 【辅助方法】==========

    private String getSuitabilityForCrop(Plot plot, CropType crop) {
        int score = 0;

        if (plot.getSunlightHours() >= 8) score += 2;
        if ("黑土".equals(plot.getSoilType())) score += 2;
        if (plot.getArea().doubleValue() >= 100) score += 1;

        return score >= 4 ? "非常适合" : score >= 2 ? "适合" : "一般";
    }

    private boolean matchesLevel(Plot plot, String level) {
        if ("beginner".equals(level)) {
            // 新手：中等面积、充足日照、优质土壤
            return plot.getArea().doubleValue() >= 80 &&
                    plot.getArea().doubleValue() <= 150 &&
                    plot.getSunlightHours() >= 6;
        } else if ("intermediate".equals(level)) {
            return true; // 中级：所有地块都可以
        } else if ("advanced".equals(level)) {
            // 高级：各种地块都可以尝试
            return true;
        }
        return false;
    }

    private String getLevelReason(Plot plot, String level) {
        if ("beginner".equals(level)) {
            return "📍 适合初学者：面积适中，易于管理";
        } else if ("intermediate".equals(level)) {
            return "📍 适合中级用户：挑战性适中";
        }
        return "📍 适合高级用户：可以尝试各种条件";
    }
}