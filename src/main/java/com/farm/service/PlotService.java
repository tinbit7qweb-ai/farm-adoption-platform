package com.farm.service;

import com.farm.entity.Plot;
import com.farm.entity.Farm;
import com.farm.repository.PlotRepository;
import com.farm.repository.FarmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PlotService {
    @Autowired
    private PlotRepository plotRepository;

    @Autowired
    private FarmRepository farmRepository;

    // 1️⃣ 获取所有待认养的地块
    public List<Plot> getAvailablePlots() {
        return plotRepository.findByStatus(0);
    }

    // 2️⃣ 获取某农场的地块
    public List<Plot> getPlotsByFarm(Integer farmId) {
        return plotRepository.findByFarmId(farmId);
    }

    // 3️⃣ 获取某农场的待认养地块
    public List<Plot> getAvailablePlotsByFarm(Integer farmId) {
        return plotRepository.findByFarmIdAndStatus(farmId, 0);
    }

    // 4️⃣ 获取地块详情
    public Plot getPlotDetail(Integer plotId) {
        Optional<Plot> plot = plotRepository.findById(plotId);
        if (!plot.isPresent()) {
            throw new RuntimeException("地块不存在！");
        }
        return plot.get();
    }

    // 5️⃣ 创建新地块（农场主权限）
    public Plot createPlot(Integer farmId, String plotNum, Double area, String soilType, Integer sunlightHours) {
        // 检查农场是否存在
        Optional<Farm> farm = farmRepository.findById(farmId);
        if (!farm.isPresent()) {
            throw new RuntimeException("农场不存在！");
        }

        // 检查地块编号是否重复
        Optional<Plot> existingPlot = plotRepository.findByPlotNum(plotNum);
        if (existingPlot.isPresent()) {
            throw new RuntimeException("地块编号已存在！");
        }

        Plot plot = new Plot();
        plot.setPlotNum(plotNum);
        plot.setArea(new java.math.BigDecimal(area));
        plot.setStatus(0); // 初始状态为待认养
        plot.setFarmId(farmId);
        plot.setSoilType(soilType);
        plot.setSunlightHours(sunlightHours);

        return plotRepository.save(plot);
    }

    // 6️⃣ 更新地块状态
    public Plot updatePlotStatus(Integer plotId, Integer status) {
        Plot plot = getPlotDetail(plotId);
        plot.setStatus(status);
        return plotRepository.save(plot);
    }

    // 7️⃣ 获取最优地块（推荐算法）- 根据日照时长和面积综合评分
    public List<Plot> getRecommendedPlots() {
        List<Plot> allPlots = plotRepository.findAllAvailablePlots();
        // 这里可以加更复杂的算法，现在就返回按日照时长排序的地块
        return allPlots;
    }
}