package com.farm.controller;

import com.farm.dto.AiSuggestionRequest;
import com.farm.dto.ChatRequest;
import com.farm.dto.ApiResponse;
import com.farm.entity.AiSuggestion;
import com.farm.entity.ChatMessage;
import com.farm.service.AiService;
import com.farm.service.RealAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private RealAiService realAiService;

    // ========== 一、AI 聊天模块（对接 DeepSeek 真实AI） ==========
    /**
     * 聊天对话
     */
    @PostMapping("/chat")
    public ApiResponse<Map<String, String>> chat(@RequestBody ChatRequest request) {
        try {
            String aiResponse = realAiService.chatWithAi(request.getMessage(), null);
            Map<String, String> result = new HashMap<>();
            result.put("userMessage", request.getMessage());
            result.put("aiResponse", aiResponse);
            return ApiResponse.success("聊天成功", result);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("聊天失败：" + e.getMessage());
        }
    }

    /**
     * 获取聊天历史记录
     */
    @GetMapping("/chat-history/{userId}")
    public ApiResponse<List<ChatMessage>> getChatHistory(@PathVariable Integer userId) {
        try {
            List<ChatMessage> history = aiService.getChatHistory(userId);
            return ApiResponse.success("获取成功", history);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // ========== 二、农场&日记生成（DeepSeek 真实AI） ==========
    /**
     * 生成植物种植日记
     */
    @PostMapping("/generate-diary")
    public ApiResponse<String> generatePlantDiary(
            @RequestParam String plantName,
            @RequestParam String cropType,
            @RequestParam Integer daysGrown,
            @RequestParam String currentStatus) {
        try {
            String diary = realAiService.generatePlantDiary(plantName, cropType, daysGrown, currentStatus);
            return ApiResponse.success("日记生成成功", diary);
        } catch (Exception e) {
            return ApiResponse.error("生成失败：" + e.getMessage());
        }
    }

    /**
     * 生成农场描述文案
     */
    @GetMapping("/farm-description")
    public ApiResponse<String> generateFarmDescription(
            @RequestParam String farmType,
            @RequestParam String cropName) {
        try {
            String description = realAiService.generateFarmImageDescription(farmType, cropName);
            return ApiResponse.success("描述生成成功", description);
        } catch (Exception e) {
            return ApiResponse.error("生成失败：" + e.getMessage());
        }
    }

    // ========== 三、种植相关智能建议模块 ==========
    /**
     * 种植建议
     */
    @PostMapping("/planting-advice")
    public ApiResponse<String> getPlantingAdvice(@RequestBody AiSuggestionRequest request) {
        try {
            String advice = aiService.generatePlantingSuggestion(
                    request.getCropId(),
                    request.getSoilType(),
                    request.getSunlightHours()
            );
            aiService.saveAiSuggestion(null, request.getCropId(), advice, "种植建议");
            return ApiResponse.success("种植建议生成成功！", advice);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 作物生长预测
     */
    @PostMapping("/growth-prediction")
    public ApiResponse<String> getGrowthPrediction(@RequestBody AiSuggestionRequest request) {
        try {
            String prediction = aiService.generateGrowthPrediction(
                    request.getCropId(),
                    request.getDaysGrown()
            );
            aiService.saveAiSuggestion(null, request.getCropId(), prediction, "预测");
            return ApiResponse.success("生长预测生成成功！", prediction);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 防病防虫建议
     */
    @PostMapping("/pest-prevention")
    public ApiResponse<String> getPestPrevention(@RequestBody AiSuggestionRequest request) {
        try {
            String advice = aiService.generatePestPreventionAdvice(
                    request.getCropId(),
                    request.getSeason()
            );
            aiService.saveAiSuggestion(null, request.getCropId(), advice, "防病防虫");
            return ApiResponse.success("防病防虫建议生成成功！", advice);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 根据订单ID查询历史AI建议
     */
    @GetMapping("/suggestions/{orderId}")
    public ApiResponse<List<AiSuggestion>> getOrderSuggestions(@PathVariable Integer orderId) {
        try {
            List<AiSuggestion> suggestions = aiService.getOrderSuggestions(orderId);
            return ApiResponse.success("获取成功", suggestions);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 综合推荐建议
     */
    @PostMapping("/recommendation")
    public ApiResponse<Map<String, Object>> getComprehensiveRecommendation(@RequestBody AiSuggestionRequest request) {
        try {
            Map<String, Object> recommendation = new HashMap<>();

            String plantingAdvice = aiService.generatePlantingSuggestion(
                    request.getCropId(),
                    request.getSoilType(),
                    request.getSunlightHours()
            );
            String growthPrediction = aiService.generateGrowthPrediction(
                    request.getCropId(),
                    request.getDaysGrown() != null ? request.getDaysGrown() : 0
            );
            String pestAdvice = aiService.generatePestPreventionAdvice(
                    request.getCropId(),
                    request.getSeason() != null ? request.getSeason() : "春季"
            );

            recommendation.put("plantingAdvice", plantingAdvice);
            recommendation.put("growthPrediction", growthPrediction);
            recommendation.put("pestAdvice", pestAdvice);

            return ApiResponse.success("综合建议生成成功！", recommendation);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}