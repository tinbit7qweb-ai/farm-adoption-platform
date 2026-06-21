package com.farm.controller;

import com.farm.dto.ApiResponse;
import com.farm.dto.FarmChatRequest;
import com.farm.entity.FarmChatMessage;
import com.farm.service.FarmChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/farm-chat")
@CrossOrigin(origins = "*")
public class FarmChatController {
    @Autowired
    private FarmChatService farmChatService;

    @PostMapping("/send")
    public ApiResponse<FarmChatMessage> sendMessage(@RequestBody FarmChatRequest request) {
        try {
            FarmChatMessage message = farmChatService.sendMessage(
                    request.getPlotId(),
                    request.getOrderId(),
                    request.getUserId(),
                    request.getFarmerId(),
                    request.getSenderRole(),
                    request.getContent()
            );
            return ApiResponse.success("消息发送成功", message);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/plot/{plotId}")
    public ApiResponse<List<FarmChatMessage>> getPlotMessages(@PathVariable Integer plotId) {
        try {
            return ApiResponse.success(farmChatService.getPlotMessages(plotId));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<FarmChatMessage>> getUserMessages(@PathVariable Integer userId) {
        try {
            return ApiResponse.success(farmChatService.getUserMessages(userId));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/farmer/{farmerId}")
    public ApiResponse<List<FarmChatMessage>> getFarmerMessages(@PathVariable Integer farmerId) {
        try {
            return ApiResponse.success(farmChatService.getFarmerMessages(farmerId));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/read/{plotId}")
    public ApiResponse<String> markRead(@PathVariable Integer plotId, @RequestParam String viewerRole) {
        try {
            farmChatService.markRead(plotId, viewerRole);
            return ApiResponse.success("已读状态已更新");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
