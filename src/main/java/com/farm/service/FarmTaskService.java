package com.farm.service;

import com.farm.entity.FarmTask;
import com.farm.entity.TraceabilityRecord;
import com.farm.repository.FarmTaskRepository;
import com.farm.repository.TraceabilityRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FarmTaskService {
    @Autowired
    private FarmTaskRepository farmTaskRepository;

    @Autowired
    private TraceabilityRecordRepository traceabilityRecordRepository;

    public FarmTask createTask(Integer plotId, Integer orderId, Integer farmerId, String taskType,
                               LocalDate dueDate, String note) {
        FarmTask task = new FarmTask();
        task.setPlotId(plotId);
        task.setOrderId(orderId);
        task.setFarmerId(farmerId);
        task.setTaskType(taskType);
        task.setDueDate(dueDate != null ? dueDate : LocalDate.now());
        task.setNote(note);
        task.setStatus("pending");
        task.setCreatedAt(LocalDateTime.now());
        return farmTaskRepository.save(task);
    }

    public List<FarmTask> getFarmerTasks(Integer farmerId) {
        return farmTaskRepository.findByFarmerIdOrderByDueDateAsc(farmerId);
    }

    public List<FarmTask> getOrderTasks(Integer orderId) {
        return farmTaskRepository.findByOrderIdOrderByDueDateAsc(orderId);
    }

    public FarmTask completeTask(Integer taskId, String photoUrl, String note) {
        FarmTask task = farmTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("农事任务不存在"));
        task.setStatus("completed");
        task.setPhotoUrl(photoUrl);
        task.setNote(note != null ? note : task.getNote());
        task.setCompletedAt(LocalDateTime.now());
        FarmTask saved = farmTaskRepository.save(task);

        if (task.getOrderId() != null) {
            TraceabilityRecord record = new TraceabilityRecord();
            record.setOrderId(task.getOrderId());
            record.setActionName(task.getTaskType());
            record.setActionDetail(task.getNote() != null ? task.getNote() : task.getTaskType() + "任务已完成");
            record.setImageUrl(photoUrl);
            record.setRecordTime(LocalDateTime.now());
            traceabilityRecordRepository.save(record);
        }

        return saved;
    }
}
