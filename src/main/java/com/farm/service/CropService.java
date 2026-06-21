package com.farm.service;

import com.farm.entity.CropType;
import com.farm.repository.CropTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CropService {
    @Autowired
    private CropTypeRepository cropTypeRepository;

    // 1️⃣ 获取所有作物
    public List<CropType> getAllCrops() {
        return cropTypeRepository.findAll();
    }

    // 2️⃣ 按分类获取作物
    public List<CropType> getCropsByCategory(String category) {
        return cropTypeRepository.findByCategory(category);
    }

    // 3️⃣ 获取作物详情
    public CropType getCropDetail(Integer cropId) {
        Optional<CropType> crop = cropTypeRepository.findById(cropId);
        if (!crop.isPresent()) {
            throw new RuntimeException("作物不存在！");
        }
        return crop.get();
    }

    // 4️⃣ 创建新作物（管理员权限）
    public CropType createCrop(String cropName, String category, Integer growthDays,
                               String waterRequirement, String temperatureRange, String description) {
        // 检查作物名称是否重复
        Optional<CropType> existingCrop = cropTypeRepository.findByCropName(cropName);
        if (existingCrop.isPresent()) {
            throw new RuntimeException("作物已存在！");
        }

        CropType crop = new CropType();
        crop.setCropName(cropName);
        crop.setCategory(category);
        crop.setGrowthDays(growthDays);
        crop.setWaterRequirement(waterRequirement);
        crop.setTemperatureRange(temperatureRange);
        crop.setDescription(description);

        return cropTypeRepository.save(crop);
    }

    // 5️⃣ 推荐适合新手的作物（生长周期短）
    public List<CropType> getBeginnerFriendlyCrops() {
        return cropTypeRepository.findByGrowthDaysLessThan(60);
    }
}