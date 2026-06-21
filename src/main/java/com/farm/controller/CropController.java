package com.farm.controller;

import com.farm.dto.ApiResponse;
import com.farm.entity.CropType;
import com.farm.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/crop")
@CrossOrigin(origins = "*")
public class CropController {
    @Autowired
    private CropService cropService;

    // 1️⃣ 【GET /api/crop/all】获取所有作物
    @GetMapping("/all")
    public ApiResponse<List<CropType>> getAllCrops() {
        try {
            List<CropType> crops = cropService.getAllCrops();
            return ApiResponse.success("获取成功", crops);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 2️⃣ 【GET /api/crop/category/{category}】按分类获取作物
    @GetMapping("/category/{category}")
    public ApiResponse<List<CropType>> getCropsByCategory(@PathVariable String category) {
        try {
            List<CropType> crops = cropService.getCropsByCategory(category);
            return ApiResponse.success("获取成功", crops);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 3️⃣ 【GET /api/crop/{cropId}】获取作物详情
    @GetMapping("/{cropId}")
    public ApiResponse<CropType> getCropDetail(@PathVariable Integer cropId) {
        try {
            CropType crop = cropService.getCropDetail(cropId);
            return ApiResponse.success(crop);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 4️⃣ 【POST /api/crop/create】创建新作物（管理员权限）
    @PostMapping("/create")
    public ApiResponse<CropType> createCrop(
            @RequestParam String cropName,
            @RequestParam String category,
            @RequestParam Integer growthDays,
            @RequestParam String waterRequirement,
            @RequestParam String temperatureRange,
            @RequestParam String description) {
        try {
            CropType crop = cropService.createCrop(
                    cropName, category, growthDays, waterRequirement, temperatureRange, description
            );
            return ApiResponse.success("作物创建成功！", crop);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 5️⃣ 【GET /api/crop/beginner-friendly】获取新手友好作物
    @GetMapping("/beginner-friendly")
    public ApiResponse<List<CropType>> getBeginnerFriendlyCrops() {
        try {
            List<CropType> crops = cropService.getBeginnerFriendlyCrops();
            return ApiResponse.success("生长周期短的作物推荐", crops);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}