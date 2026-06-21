package com.farm.controller;

import com.farm.dto.ApiResponse;
import com.farm.dto.FarmTaskRequest;
import com.farm.entity.FarmTask;
import com.farm.service.FarmTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/farm-task")
@CrossOrigin(origins = "*")
public class FarmTaskController {
    @Autowired
    private FarmTaskService farmTaskService;

    @PostMapping("/create")
    public ApiResponse<FarmTask> createTask(@RequestBody FarmTaskRequest request) {
        try {
            FarmTask task = farmTaskService.createTask(
                    request.getPlotId(),
                    request.getOrderId(),
                    request.getFarmerId(),
                    request.getTaskType(),
                    request.getDueDate(),
                    request.getNote()
            );
            return ApiResponse.success("农事任务已创建", task);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/farmer/{farmerId}")
    public ApiResponse<List<FarmTask>> getFarmerTasks(@PathVariable Integer farmerId) {
        try {
            return ApiResponse.success(farmTaskService.getFarmerTasks(farmerId));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<List<FarmTask>> getOrderTasks(@PathVariable Integer orderId) {
        try {
            return ApiResponse.success(farmTaskService.getOrderTasks(orderId));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/complete/{taskId}")
    public ApiResponse<FarmTask> completeTask(
            @PathVariable Integer taskId,
            @RequestParam(required = false) String photoUrl,
            @RequestParam(required = false) String note) {
        try {
            return ApiResponse.success("任务已完成", farmTaskService.completeTask(taskId, photoUrl, note));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
