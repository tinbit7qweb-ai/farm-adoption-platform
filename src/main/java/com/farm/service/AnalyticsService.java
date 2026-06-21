package com.farm.service;

import com.farm.entity.Plot;
import com.farm.entity.AdoptionOrder;
import com.farm.entity.CropType;
import com.farm.entity.TraceabilityRecord;
import com.farm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 【数据分析服务】
 * 用于生成：
 * - 农场经营数据
 * - 用户行为分析
 * - 作物生长统计
 * - 收益预测
 */
@Service
public class AnalyticsService {
    @Autowired
    private PlotRepository plotRepository;

    @Autowired
    private AdoptionOrderRepository adoptionOrderRepository;

    @Autowired
    private CropTypeRepository cropTypeRepository;

    @Autowired
    private TraceabilityRecordRepository traceabilityRecordRepository;

    @Autowired
    private UserRepository userRepository;

    // ========== 【农场统计】==========

    /**
     * 1️⃣ 获取农场概览统计
     */
    public Map<String, Object> getFarmOverviewStats() {
        Map<String, Object> stats = new HashMap<>();

        // 地块总数
        long totalPlots = plotRepository.count();
        stats.put("totalPlots", totalPlots);

        // 待认养地块数
        long availablePlots = plotRepository.findByStatus(0).size();
        stats.put("availablePlots", availablePlots);

        // 认养中地块数
        long activeAdoptions = plotRepository.findByStatus(1).size();
        stats.put("activeAdoptions", activeAdoptions);

        // 已完成地块数
        long completedPlots = plotRepository.findByStatus(2).size();
        stats.put("completedPlots", completedPlots);

        // 认养率
        double adoptionRate = totalPlots > 0 ? (double) activeAdoptions / totalPlots * 100 : 0;
        stats.put("adoptionRate", String.format("%.1f", adoptionRate));

        return stats;
    }

    // ========== 【用户行为分析】==========

    /**
     * 2️⃣ 获取用户的详细行为分析
     */
    public Map<String, Object> getUserBehaviorAnalysis(Integer userId) {
        Map<String, Object> analysis = new HashMap<>();

        // 用户的所有订单
        List<AdoptionOrder> allOrders = adoptionOrderRepository.findByUserId(userId);
        analysis.put("totalAdoptions", allOrders.size());

        // 活跃订单
        List<AdoptionOrder> activeOrders = adoptionOrderRepository.findActiveOrdersByUserId(userId);
        analysis.put("activeAdoptions", activeOrders.size());

        // 历史订单
        List<AdoptionOrder> historyOrders = adoptionOrderRepository.findHistoryOrdersByUserId(userId);
        analysis.put("completedAdoptions", historyOrders.size());

        // 作物偏好统计
        Map<String, Long> cropPreferences = allOrders.stream()
                .filter(order -> order.getCropId() != null)
                .collect(Collectors.groupingBy(
                        order -> {
                            Optional<CropType> crop = cropTypeRepository.findById(order.getCropId());
                            return crop.isPresent() ? crop.get().getCropName() : "未知";
                        },
                        Collectors.counting()
                ));
        analysis.put("cropPreferences", cropPreferences);

        // 平均认养周期（天数）
        if (!allOrders.isEmpty()) {
            double avgDays = allOrders.stream()
                    .mapToLong(order -> {
                        long days = java.time.temporal.ChronoUnit.DAYS.between(
                                order.getCreateTime(),
                                order.getEndDate()
                        );
                        return days;
                    })
                    .average()
                    .orElse(0);
            analysis.put("averageAdoptionDays", (long) avgDays);
        }

        // 用户经验等级
        String experienceLevel;
        if (allOrders.size() == 0) {
            experienceLevel = "新手";
        } else if (allOrders.size() < 3) {
            experienceLevel = "初级";
        } else if (allOrders.size() < 8) {
            experienceLevel = "中级";
        } else {
            experienceLevel = "高级";
        }
        analysis.put("experienceLevel", experienceLevel);

        return analysis;
    }

    // ========== 【作物数据统计】==========

    /**
     * 3️⃣ 获取作物的流行度排行
     */
    public List<Map<String, Object>> getCropPopularityRanking() {
        List<AdoptionOrder> allOrders = adoptionOrderRepository.findAll();

        Map<Integer, Long> cropStats = allOrders.stream()
                .filter(order -> order.getCropId() != null)
                .collect(Collectors.groupingBy(
                        AdoptionOrder::getCropId,
                        Collectors.counting()
                ));

        return cropStats.entrySet().stream()
                .map(entry -> {
                    Optional<CropType> crop = cropTypeRepository.findById(entry.getKey());
                    Map<String, Object> item = new HashMap<>();

                    if (crop.isPresent()) {
                        item.put("cropName", crop.get().getCropName());
                        item.put("category", crop.get().getCategory());
                        item.put("adoptionCount", entry.getValue());
                        item.put("growthDays", crop.get().getGrowthDays());
                    }

                    return item;
                })
                .sorted((a, b) -> Long.compare(
                        (Long) b.get("adoptionCount"),
                        (Long) a.get("adoptionCount")
                ))
                .collect(Collectors.toList());
    }

    // ========== 【土壤分布分析】==========

    /**
     * 4️⃣ 分析不同土壤类型的地块分布
     */
    public Map<String, Long> getSoilDistribution() {
        List<Plot> allPlots = plotRepository.findAll();

        return allPlots.stream()
                .collect(Collectors.groupingBy(
                        plot -> plot.getSoilType() != null ? plot.getSoilType() : "未知",
                        Collectors.counting()
                ));
    }

    // ========== 【日照分析】==========

    /**
     * 5️⃣ 分析日照时长分布
     */
    public Map<String, Long> getSunlightDistribution() {
        List<Plot> allPlots = plotRepository.findAll();

        return allPlots.stream()
                .collect(Collectors.groupingBy(
                        plot -> {
                            Integer hours = plot.getSunlightHours() != null ? plot.getSunlightHours() : 6;
                            if (hours >= 10) return "优秀 (≥10小时)";
                            else if (hours >= 8) return "良好 (8-10小时)";
                            else if (hours >= 6) return "中等 (6-8小时)";
                            else return "较差 (<6小时)";
                        },
                        Collectors.counting()
                ));
    }

    // ========== 【收益预测】==========

    /**
     * 6️⃣ 预测用户可能的收益
     */
    public Map<String, Object> predictUserRevenue(Integer userId) {
        Map<String, Object> prediction = new HashMap<>();

        List<AdoptionOrder> orders = adoptionOrderRepository.findByUserId(userId);

        if (orders.isEmpty()) {
            prediction.put("estimatedRevenue", 0);
            prediction.put("message", "还没有完成任何认养");
            return prediction;
        }

        // 简单的收益模型：每次认养假设产出 1000-5000 元（根据地块质量）
        double totalRevenue = 0;

        for (AdoptionOrder order : orders) {
            Optional<Plot> plot = plotRepository.findById(order.getPlotId());

            if (plot.isPresent()) {
                // 根据地块日照计算基础收益
                Integer sunlight = plot.get().getSunlightHours() != null ?
                        plot.get().getSunlightHours() : 6;

                double baseRevenue = 2000; // 基础产值

                if (sunlight >= 8) {
                    baseRevenue *= 1.3; // 增产 30%
                } else if (sunlight < 6) {
                    baseRevenue *= 0.8; // 减产 20%
                }

                totalRevenue += baseRevenue;
            }
        }

        prediction.put("estimatedRevenue", (int) totalRevenue);
        prediction.put("averagePerAdoption", (int) (totalRevenue / orders.size()));
        prediction.put("nextMonthPrediction", (int) (totalRevenue * 0.3)); // 月均

        return prediction;
    }

    // ========== 【溯源数据统计】==========

    /**
     * 7️⃣ 获取所有农事动作的统计
     */
    public Map<String, Object> getTraceabilityStats() {
        Map<String, Object> stats = new HashMap<>();

        List<TraceabilityRecord> allRecords = traceabilityRecordRepository.findAll();
        stats.put("totalRecords", allRecords.size());

        // 农事动作分布
        Map<String, Long> actionDistribution = allRecords.stream()
                .collect(Collectors.groupingBy(
                        record -> record.getActionName() != null ? record.getActionName() : "其他",
                        Collectors.counting()
                ));
        stats.put("actionDistribution", actionDistribution);

        // 最常见的农事动作
        Optional<Map.Entry<String, Long>> mostCommon = actionDistribution.entrySet().stream()
                .max(Map.Entry.comparingByValue());

        if (mostCommon.isPresent()) {
            stats.put("mostCommonAction", mostCommon.get().getKey());
            stats.put("actionCount", mostCommon.get().getValue());
        }

        return stats;
    }

    // ========== 【月度报告】==========

    /**
     * 8️⃣ 生成用户的月度报告
     */
    public Map<String, Object> generateMonthlyReport(Integer userId, int month, int year) {
        Map<String, Object> report = new HashMap<>();

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime monthStart = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        // 这个月创建的订单
        List<AdoptionOrder> monthlyOrders = adoptionOrderRepository.findByUserId(userId)
                .stream()
                .filter(order -> !order.getCreateTime().isBefore(monthStart) &&
                        !order.getCreateTime().isAfter(monthEnd))
                .collect(Collectors.toList());

        report.put("year", year);
        report.put("month", month);
        report.put("newAdoptions", monthlyOrders.size());

        // 这个月的溯源记录数
        int traceRecords = (int) monthlyOrders.stream()
                .mapToLong(order -> traceabilityRecordRepository
                        .findByOrderIdOrderByRecordTimeAsc(order.getOrderId()).size())
                .sum();

        report.put("traceRecords", traceRecords);

        // 月度活跃度评分（0-100）
        int activityScore = Math.min(monthlyOrders.size() * 20 + traceRecords * 5, 100);
        report.put("activityScore", activityScore);

        return report;
    }

    // ========== 【趋势分析】==========

    /**
     * 9️⃣ 分析认养趋势（最近 6 个月）
     */
    public List<Map<String, Object>> getAdoptionTrends() {
        List<AdoptionOrder> allOrders = adoptionOrderRepository.findAll();

        Map<YearMonth, Long> monthlyStats = allOrders.stream()
                .collect(Collectors.groupingBy(
                        order -> YearMonth.from(order.getCreateTime()),
                        Collectors.counting()
                ));

        return monthlyStats.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("month", entry.getKey().toString());
                    item.put("adoptionCount", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());
    }
}