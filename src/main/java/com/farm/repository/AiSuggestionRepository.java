package com.farm.repository;

import com.farm.entity.AiSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiSuggestionRepository extends JpaRepository<AiSuggestion, Integer> {
    // 1️⃣ 通过订单ID查找AI建议
    List<AiSuggestion> findByOrderId(Integer orderId);

    // 2️⃣ 通过作物ID查找AI建议
    List<AiSuggestion> findByCropId(Integer cropId);

    // 3️⃣ 通过建议类型查找
    List<AiSuggestion> findBySuggestionType(String suggestionType);

    // 4️⃣ 查找某作物的所有种植建议
    List<AiSuggestion> findByCropIdAndSuggestionType(Integer cropId, String suggestionType);
}