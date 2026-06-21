package com.farm.controller;

import com.farm.dto.ApiResponse;
import com.farm.dto.PlotRecommendationResponse;
import com.farm.entity.Farm;
import com.farm.entity.Plot;
import com.farm.entity.User;
import com.farm.repository.FarmRepository;
import com.farm.repository.UserRepository;
import com.farm.service.PlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/plot")
@CrossOrigin(origins = "*")
public class PlotController {
    @Autowired
    private PlotService plotService;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private UserRepository userRepository;

    // 1️⃣ 【GET /api/plot/available】获取所有待认养地块
    @GetMapping("/available")
    public ApiResponse<List<Plot>> getAvailablePlots() {
        try {
            List<Plot> plots = plotService.getAvailablePlots();
            return ApiResponse.success("获取成功", plots);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 2️⃣ 【GET /api/plot/farm/{farmId}】获取农场的地块
    @GetMapping("/farm/{farmId}")
    public ApiResponse<List<Plot>> getPlotsByFarm(@PathVariable Integer farmId) {
        try {
            List<Plot> plots = plotService.getPlotsByFarm(farmId);
            return ApiResponse.success(plots);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 3️⃣ 【GET /api/plot/farm/{farmId}/available】获取农场的待认养地块
    @GetMapping("/farm/{farmId}/available")
    public ApiResponse<List<Plot>> getAvailablePlotsByFarm(@PathVariable Integer farmId) {
        try {
            List<Plot> plots = plotService.getAvailablePlotsByFarm(farmId);
            return ApiResponse.success(plots);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 4️⃣ 【GET /api/plot/{plotId}】获取地块详情
    @GetMapping("/{plotId}")
    public ApiResponse<Plot> getPlotDetail(@PathVariable Integer plotId) {
        try {
            Plot plot = plotService.getPlotDetail(plotId);
            return ApiResponse.success(plot);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 5️⃣ 【POST /api/plot/create】创建新地块（农场主权限）
    @PostMapping("/create")
    public ApiResponse<Plot> createPlot(
            @RequestParam Integer farmId,
            @RequestParam String plotNum,
            @RequestParam Double area,
            @RequestParam String soilType,
            @RequestParam Integer sunlightHours) {
        try {
            Plot plot = plotService.createPlot(farmId, plotNum, area, soilType, sunlightHours);
            return ApiResponse.success("地块创建成功！", plot);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 6️⃣ 【GET /api/plot/recommended】获取推荐地块（带评分）
    @GetMapping("/recommended")
    public ApiResponse<List<PlotRecommendationResponse>> getRecommendedPlots() {
        try {
            List<Plot> plots = plotService.getRecommendedPlots();
            List<PlotRecommendationResponse> recommendations = new ArrayList<>();

            for (Plot plot : plots) {
                PlotRecommendationResponse response = new PlotRecommendationResponse();
                response.setPlotId(plot.getPlotId());
                response.setPlotNum(plot.getPlotNum());
                response.setArea(plot.getArea());
                response.setSoilType(plot.getSoilType());
                response.setSunlightHours(plot.getSunlightHours());
                response.setFarmId(plot.getFarmId());
                Optional<Farm> farm = farmRepository.findById(plot.getFarmId());
                if (farm.isPresent()) {
                    response.setFarmName(farm.get().getFarmName());
                    response.setFarmerId(farm.get().getOwnerId());
                    response.setLocation(farm.get().getLocation());
                    Optional<User> farmer = userRepository.findById(farm.get().getOwnerId());
                    farmer.ifPresent(user -> {
                        response.setFarmerName(user.getRealName());
                        response.setFarmerPhone(user.getPhone());
                    });
                }

                // 【推荐算法】计算推荐分数
                Double score = calculateRecommendationScore(plot);
                response.setRecommendationScore(score);

                if (plot.getSunlightHours() >= 8 && plot.getArea().doubleValue() >= 80) {
                    response.setRecommendationReason("优质地块：光照充足，面积较大，非常适合初学者");
                } else if (plot.getSunlightHours() >= 6) {
                    response.setRecommendationReason("良好地块：光照条件良好，适合大多数作物");
                } else {
                    response.setRecommendationReason("可选地块：建议种植耐阴作物");
                }

                recommendations.add(response);
            }

            return ApiResponse.success("推荐地块获取成功", recommendations);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 【推荐算法】计算地块推荐分数
    private Double calculateRecommendationScore(Plot plot) {
        Double score = 0.0;

        // 日照权重 40%
        if (plot.getSunlightHours() >= 8) {
            score += 4.0;
        } else if (plot.getSunlightHours() >= 6) {
            score += 3.0;
        } else if (plot.getSunlightHours() >= 4) {
            score += 2.0;
        } else {
            score += 1.0;
        }

        // 面积权重 30%
        Double areaScore = plot.getArea().doubleValue() / 200 * 3; // 假设 200 平方米为满分
        score += Math.min(areaScore, 3.0);

        // 土壤权重 30%
        if ("黑土".equals(plot.getSoilType())) {
            score += 3.0;
        } else if ("红土".equals(plot.getSoilType())) {
            score += 2.5;
        } else {
            score += 2.0;
        }

        return Math.min(score, 10.0); // 最高 10 分
    }
}
