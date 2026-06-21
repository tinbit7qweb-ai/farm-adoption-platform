package com.farm.service;

import com.farm.dto.AdoptionOrderResponse;
import com.farm.entity.AdoptionOrder;
import com.farm.entity.Farm;
import com.farm.entity.Plot;
import com.farm.entity.User;
import com.farm.entity.TraceabilityRecord;
import com.farm.repository.AdoptionOrderRepository;
import com.farm.repository.FarmRepository;
import com.farm.repository.PlotRepository;
import com.farm.repository.UserRepository;
import com.farm.repository.TraceabilityRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdoptionService {
    @Autowired
    private AdoptionOrderRepository adoptionOrderRepository;

    @Autowired
    private PlotRepository plotRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TraceabilityRecordRepository traceabilityRecordRepository;

    @Autowired
    private FarmRepository farmRepository;

    // 1️⃣ 【核心逻辑】用户认养地块 - 使用事务保证原子性
    @Transactional
    public AdoptionOrder adoptPlot(Integer userId, Integer plotId, Integer cropId, Integer durationMonths) {
        // 检查用户是否存在
        Optional<User> user = userRepository.findById(userId);
        if (!user.isPresent()) {
            throw new RuntimeException("用户不存在！");
        }

        // 检查地块是否存在
        Optional<Plot> plot = plotRepository.findById(plotId);
        if (!plot.isPresent()) {
            throw new RuntimeException("地块不存在！");
        }

        // 检查地块是否已被认养
        if (plot.get().getStatus() != 0) {
            throw new RuntimeException("地块已被认养或已完成，无法再次认养！");
        }

        // 创建认养订单
        AdoptionOrder order = new AdoptionOrder();
        order.setUserId(userId);
        order.setPlotId(plotId);
        order.setCropId(cropId);
        order.setCreateTime(LocalDateTime.now());
        order.setEndDate(LocalDateTime.now().plusMonths(durationMonths));
        order.setDurationMonths(durationMonths);
        order.setStatus("active");
        order.setPaymentStatus("unpaid");

        // 保存订单
        AdoptionOrder savedOrder = adoptionOrderRepository.save(order);

        // 更新地块状态为"认养中"
        plot.get().setStatus(1);
        plotRepository.save(plot.get());

        // 【自动触发】创建溯源记录 - 记录认养开始
        TraceabilityRecord record = new TraceabilityRecord();
        record.setOrderId(savedOrder.getOrderId());
        record.setActionName("认养开始");
        record.setActionDetail("用户 " + user.get().getRealName() + " 成功认养了地块 " + plot.get().getPlotNum());
        record.setRecordTime(LocalDateTime.now());
        traceabilityRecordRepository.save(record);

        return savedOrder;
    }

    // 2️⃣ 获取用户的活跃订单
    public List<AdoptionOrder> getUserActiveOrders(Integer userId) {
        return adoptionOrderRepository.findActiveOrdersByUserId(userId);
    }

    public List<AdoptionOrderResponse> getUserActiveOrderDetails(Integer userId) {
        return adoptionOrderRepository.findActiveOrdersByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // 3️⃣ 获取用户的历史订单
    public List<AdoptionOrder> getUserHistoryOrders(Integer userId) {
        return adoptionOrderRepository.findHistoryOrdersByUserId(userId);
    }

    public List<AdoptionOrderResponse> getUserHistoryOrderDetails(Integer userId) {
        return adoptionOrderRepository.findHistoryOrdersByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // 4️⃣ 获取订单详情
    public AdoptionOrder getOrderDetail(Integer orderId) {
        Optional<AdoptionOrder> order = adoptionOrderRepository.findById(orderId);
        if (!order.isPresent()) {
            throw new RuntimeException("订单不存在！");
        }
        return order.get();
    }

    public AdoptionOrderResponse getOrderDetailResponse(Integer orderId) {
        return toResponse(getOrderDetail(orderId));
    }

    private AdoptionOrderResponse toResponse(AdoptionOrder order) {
        AdoptionOrderResponse response = new AdoptionOrderResponse();
        response.setOrderId(order.getOrderId());
        response.setUserId(order.getUserId());
        response.setPlotId(order.getPlotId());
        response.setCropId(order.getCropId());
        response.setDurationMonths(order.getDurationMonths());
        response.setCreateTime(order.getCreateTime());
        response.setEndDate(order.getEndDate());
        response.setStatus(order.getStatus());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setCrop(order.getCropId() != null ? "作物 #" + order.getCropId() : "已选作物");

        plotRepository.findById(order.getPlotId()).ifPresent(plot -> {
            response.setPlotNum(plot.getPlotNum());
            response.setTitle("地块 " + plot.getPlotNum());
            response.setFarmId(plot.getFarmId());

            farmRepository.findById(plot.getFarmId()).ifPresent(farm -> {
                response.setFarmName(farm.getFarmName());
                response.setLocation(farm.getLocation());
                response.setFarmerId(farm.getOwnerId());

                userRepository.findById(farm.getOwnerId()).ifPresent(farmer -> {
                    response.setFarmerName(farmer.getRealName());
                    response.setFarmerPhone(farmer.getPhone());
                });
            });
        });

        return response;
    }

    // 5️⃣ 取消认养（用户操作）
    @Transactional
    public void cancelAdoption(Integer orderId) {
        AdoptionOrder order = getOrderDetail(orderId);

        // 只能取消"活跃"状态的订单
        if (!order.getStatus().equals("active")) {
            throw new RuntimeException("只能取消活跃订单！");
        }

        // 更新订单状态
        order.setStatus("cancelled");
        adoptionOrderRepository.save(order);

        // 释放地块（状态改回0）
        Optional<Plot> plot = plotRepository.findById(order.getPlotId());
        if (plot.isPresent()) {
            plot.get().setStatus(0);
            plotRepository.save(plot.get());
        }

        // 记录溯源
        TraceabilityRecord record = new TraceabilityRecord();
        record.setOrderId(orderId);
        record.setActionName("认养取消");
        record.setActionDetail("用户取消了这次认养");
        record.setRecordTime(LocalDateTime.now());
        traceabilityRecordRepository.save(record);
    }

    // 6️⃣ 完成认养（系统或农场主操作）
    @Transactional
    public void completeAdoption(Integer orderId) {
        AdoptionOrder order = getOrderDetail(orderId);
        order.setStatus("completed");
        adoptionOrderRepository.save(order);

        // 更新地块状态为"已完成"
        Optional<Plot> plot = plotRepository.findById(order.getPlotId());
        if (plot.isPresent()) {
            plot.get().setStatus(2);
            plotRepository.save(plot.get());
        }

        // 记录溯源
        TraceabilityRecord record = new TraceabilityRecord();
        record.setOrderId(orderId);
        record.setActionName("认养完成");
        record.setActionDetail("该地块的认养周期已完成");
        record.setRecordTime(LocalDateTime.now());
        traceabilityRecordRepository.save(record);
    }

    // 7️⃣ 获取地块的认养统计（推荐算法 - 热度排序）
    public List<AdoptionOrder> getMostPopularPlots() {
        // 这里可以加复杂的SQL查询，统计哪些地块被认养最多次
        return adoptionOrderRepository.findAll();
    }
}
