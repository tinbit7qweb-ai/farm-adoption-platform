package com.farm.util;

import com.farm.entity.Plot;
import com.farm.entity.CropType;
import com.farm.entity.AdoptionOrder;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 【高级推荐算法引擎】
 * 采用多维评分系统：
 * 1. 地块质量评分 (40%)
 * 2. 用户偏好匹配度 (35%)
 * 3. 人气热度评分 (15%)
 * 4. 新用户倾斜因子 (10%)
 */
public class RecommendationEngine {

    // ========== 【地块质量评分】==========
    // 权重：40%

    /**
     * 计算地块的基础质量评分
     * 考虑因素：日照、面积、土壤、位置多样性
     */
    public static Double calculatePlotQualityScore(Plot plot) {
        double score = 0.0;

        // 1️⃣ 日照评分（40% 权重）
        Integer sunlight = plot.getSunlightHours() != null ? plot.getSunlightHours() : 6;
        if (sunlight >= 10) {
            score += 4.0; // 优秀
        } else if (sunlight >= 8) {
            score += 3.5;
        } else if (sunlight >= 6) {
            score += 3.0;
        } else if (sunlight >= 4) {
            score += 2.0;
        } else {
            score += 1.0;
        }

        // 2️⃣ 面积评分（30% 权重）
        // 假设 100-200 平方米是最优范围
        Double area = plot.getArea() != null ? plot.getArea().doubleValue() : 100;
        if (area >= 150 && area <= 250) {
            score += 3.0;
        } else if (area >= 80 && area <= 300) {
            score += 2.7;
        } else if (area >= 50 && area <= 400) {
            score += 2.2;
        } else {
            score += 1.5;
        }

        // 3️⃣ 土壤质量评分（20% 权重）
        String soil = plot.getSoilType() != null ? plot.getSoilType() : "未知";
        if ("黑土".equals(soil)) {
            score += 2.0; // 最优
        } else if ("褐土".equals(soil) || "壤土".equals(soil)) {
            score += 1.8;
        } else if ("红土".equals(soil)) {
            score += 1.5;
        } else if ("沙土".equals(soil)) {
            score += 1.2;
        } else {
            score += 1.0;
        }

        // 4️⃣ 面积多样性奖励（10% 权重）
        // 鼓励小、中、大面积的均衡分布
        if (area >= 100 && area <= 150) {
            score += 1.0; // 中等面积，容易上手
        }

        return Math.min(score, 10.0); // 最高 10 分
    }

    // ========== 【用户偏好匹配度】==========
    // 权重：35%

    /**
     * 计算地块与用户偏好的匹配度
     * 考虑因素：用户历史认养、作物偏好、经验等级
     */
    public static Double calculateUserPreferenceMatch(
            Plot plot,
            List<AdoptionOrder> userHistory,
            String userRole,
            CropType targetCrop) {

        double score = 0.0;

        // 1️⃣ 经验等级匹配（40% 权重）
        int adoptionCount = userHistory != null ? userHistory.size() : 0;

        if ("farmer".equals(userRole)) {
            // 农场主：倾向大面积、高日照
            if (plot.getSunlightHours() >= 8 && plot.getArea().doubleValue() >= 150) {
                score += 3.5;
            } else if (plot.getSunlightHours() >= 6) {
                score += 3.0;
            } else {
                score += 2.0;
            }
        } else {
            // 普通用户
            if (adoptionCount == 0) {
                // 新用户：推荐容易上手的地块
                if (plot.getArea().doubleValue() >= 80 && plot.getArea().doubleValue() <= 150) {
                    score += 3.5;
                } else if (plot.getSunlightHours() >= 6) {
                    score += 3.0;
                } else {
                    score += 2.0;
                }
            } else if (adoptionCount >= 1 && adoptionCount < 3) {
                // 初级用户：推荐中等难度地块
                score += 3.0;
            } else {
                // 高级用户：可以尝试各种地块
                score += 3.5;
            }
        }

        // 2️⃣ 作物匹配度（35% 权重）
        if (targetCrop != null) {
            // 根据作物对环境的要求评分
            String tempRange = targetCrop.getTemperatureRange();
            String waterReq = targetCrop.getWaterRequirement();

            // 如果是需要高日照的作物，优先推荐日照好的地块
            if ("充足".equals(waterReq) && plot.getSunlightHours() >= 8) {
                score += 2.0;
            } else if ("适度".equals(waterReq)) {
                score += 1.8;
            }
        }

        // 3️⃣ 地块多样性奖励（25% 权重）
        // 如果用户以前都认养同一个农场的地块，推荐其他农场的地块
        if (userHistory != null && userHistory.size() > 0) {
            Set<Integer> farmsVisited = userHistory.stream()
                    .map(order -> order.getPlotId()) // 这里简化处理
                    .collect(Collectors.toSet());

            if (!farmsVisited.contains(plot.getFarmId())) {
                score += 1.5; // 新农场奖励
            }
        }

        return Math.min(score, 10.0);
    }

    // ========== 【人气热度评分】==========
    // 权重：15%

    /**
     * 计算地块的人气热度
     * 考虑因素：被认养次数、评价、点赞数等
     */
    public static Double calculatePopularityScore(Plot plot, List<AdoptionOrder> allOrders) {
        double score = 5.0; // 基础分 5 分

        if (allOrders == null || allOrders.isEmpty()) {
            return score;
        }

        // 统计这个地块被认养的次数
        long adoptionCount = allOrders.stream()
                .filter(order -> plot.getPlotId().equals(order.getPlotId()))
                .count();

        // 转换为热度评分
        if (adoptionCount >= 10) {
            score = 10.0; // 超级热门
        } else if (adoptionCount >= 5) {
            score = 8.0;
        } else if (adoptionCount >= 3) {
            score = 7.0;
        } else if (adoptionCount >= 1) {
            score = 6.0;
        }

        return score;
    }

    // ========== 【新用户倾斜因子】==========
    // 权重：10%

    /**
     * 为新用户推荐适合的地块
     */
    public static Double getNewUserBonus(Plot plot, int adoptionCount) {
        if (adoptionCount > 0) {
            return 0.0; // 非新用户，无奖励
        }

        // 新用户：倾斜推荐"黑土"、"中等面积"、"充足日照"的地块
        double bonus = 0.0;

        if ("黑土".equals(plot.getSoilType())) {
            bonus += 2.0;
        }

        if (plot.getArea().doubleValue() >= 80 && plot.getArea().doubleValue() <= 150) {
            bonus += 2.0;
        }

        if (plot.getSunlightHours() >= 8) {
            bonus += 1.5;
        }

        return Math.min(bonus, 5.0);
    }

    // ========== 【综合推荐评分】==========

    /**
     * 计算地块的最终推荐评分（加权平均）
     */
    public static Double calculateFinalRecommendationScore(
            Plot plot,
            List<AdoptionOrder> userHistory,
            String userRole,
            CropType targetCrop,
            List<AdoptionOrder> allOrders) {

        double qualityScore = calculatePlotQualityScore(plot);
        double preferenceScore = calculateUserPreferenceMatch(plot, userHistory, userRole, targetCrop);
        double popularityScore = calculatePopularityScore(plot, allOrders);
        int adoptionCount = userHistory != null ? userHistory.size() : 0;
        double newUserBonus = getNewUserBonus(plot, adoptionCount);

        // 加权平均
        double finalScore =
                qualityScore * 0.40 +      // 地块质量 40%
                        preferenceScore * 0.35 +   // 用户匹配 35%
                        popularityScore * 0.15 +   // 人气热度 15%
                        newUserBonus * 0.10;       // 新用户奖励 10%

        return Math.min(finalScore, 10.0);
    }

    // ========== 【批量推荐】==========

    /**
     * 为用户推荐排序后的地块列表
     */
    public static List<Map<String, Object>> getRecommendedPlotsForUser(
            List<Plot> availablePlots,
            List<AdoptionOrder> userHistory,
            String userRole,
            CropType targetCrop,
            List<AdoptionOrder> allOrders,
            int limit) {

        return availablePlots.stream()
                .map(plot -> {
                    Double score = calculateFinalRecommendationScore(
                            plot, userHistory, userRole, targetCrop, allOrders
                    );

                    Map<String, Object> result = new HashMap<>();
                    result.put("plot", plot);
                    result.put("score", score);
                    result.put("reason", generateRecommendationReason(plot, score, userHistory.size()));

                    return result;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("score"), (Double) a.get("score")))
                .limit(limit)
                .collect(Collectors.toList());
    }

    // ========== 【生成推荐理由】==========

    /**
     * 生成用户可读的推荐理由
     */
    public static String generateRecommendationReason(Plot plot, Double score, int userAdoptionCount) {
        StringBuilder reason = new StringBuilder();

        if (score >= 9.0) {
            reason.append("⭐⭐⭐ 强烈推荐！");
        } else if (score >= 8.0) {
            reason.append("⭐⭐ 推荐");
        } else if (score >= 7.0) {
            reason.append("⭐ 可选");
        }

        reason.append(" | ");

        // 优点
        List<String> advantages = new ArrayList<>();

        if (plot.getSunlightHours() >= 8) {
            advantages.add("☀️ 光照充足");
        }

        if ("黑土".equals(plot.getSoilType())) {
            advantages.add("🌱 优质黑土");
        } else if ("褐土".equals(plot.getSoilType())) {
            advantages.add("🌱 中等土壤");
        }

        if (plot.getArea().doubleValue() >= 80 && plot.getArea().doubleValue() <= 150) {
            advantages.add("📐 中等面积");
        }

        if (userAdoptionCount == 0) {
            advantages.add("🎯 适合新手");
        }

        reason.append(String.join(" ", advantages));

        return reason.toString();
    }
}