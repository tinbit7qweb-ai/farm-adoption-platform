package com.farm.service;

import com.farm.entity.TraceabilityRecord;
import com.farm.entity.AdoptionOrder;
import com.farm.repository.TraceabilityRecordRepository;
import com.farm.repository.AdoptionOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TraceabilityService {
    @Autowired
    private TraceabilityRecordRepository traceabilityRecordRepository;

    @Autowired
    private AdoptionOrderRepository adoptionOrderRepository;

    // 1️⃣ 获取某订单的所有溯源记录
    public List<TraceabilityRecord> getOrderTraceability(Integer orderId) {
        return traceabilityRecordRepository.findByOrderIdOrderByRecordTimeAsc(orderId);
    }

    // 2️⃣ 添加溯源记录（农场主操作 - 记录农事动作）
    public TraceabilityRecord addTraceabilityRecord(Integer orderId, String actionName, String actionDetail, String imageUrl) {
        // 检查订单是否存在
        Optional<AdoptionOrder> order = adoptionOrderRepository.findById(orderId);
        if (!order.isPresent()) {
            throw new RuntimeException("订单不存在！");
        }

        TraceabilityRecord record = new TraceabilityRecord();
        record.setOrderId(orderId);
        record.setActionName(actionName);
        record.setActionDetail(actionDetail);
        record.setImageUrl(imageUrl);
        record.setRecordTime(LocalDateTime.now());

        return traceabilityRecordRepository.save(record);
    }

    // 3️⃣ 获取最新的溯源记录
    public TraceabilityRecord getLatestRecord(Integer orderId) {
        return traceabilityRecordRepository.findLatestRecordByOrderId(orderId);
    }

    // 4️⃣ 统计某动作的记录数
    public List<TraceabilityRecord> getRecordsByActionName(String actionName) {
        return traceabilityRecordRepository.findByActionName(actionName);
    }

    // 5️⃣ 生成溯源统计（用于展示）
    public String generateTraceabilityReport(Integer orderId) {
        List<TraceabilityRecord> records = getOrderTraceability(orderId);

        StringBuilder report = new StringBuilder();
        report.append("========== 溯源报告 ==========\n");
        report.append("订单ID: ").append(orderId).append("\n");
        report.append("总记录数: ").append(records.size()).append("\n\n");

        for (TraceabilityRecord record : records) {
            report.append("【").append(record.getActionName()).append("】\n");
            report.append("时间: ").append(record.getRecordTime()).append("\n");
            report.append("详情: ").append(record.getActionDetail()).append("\n");
            if (record.getImageUrl() != null) {
                report.append("图片: ").append(record.getImageUrl()).append("\n");
            }
            report.append("\n");
        }

        return report.toString();
    }
}