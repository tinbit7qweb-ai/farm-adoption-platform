package com.farm.repository;

import com.farm.entity.CropType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CropTypeRepository extends JpaRepository<CropType, Integer> {
    // 1️⃣ 通过分类查找作物（蔬菜、水果、花卉）
    List<CropType> findByCategory(String category);

    // 2️⃣ 通过作物名称查找
    Optional<CropType> findByCropName(String cropName);

    // 3️⃣ 查找生长周期较短的作物（用于推荐）
    List<CropType> findByGrowthDaysLessThan(Integer days);
}