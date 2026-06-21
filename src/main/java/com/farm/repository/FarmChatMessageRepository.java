package com.farm.repository;

import com.farm.entity.FarmChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FarmChatMessageRepository extends JpaRepository<FarmChatMessage, Integer> {
    List<FarmChatMessage> findByPlotIdOrderByCreatedAtAsc(Integer plotId);

    List<FarmChatMessage> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<FarmChatMessage> findByFarmerIdOrderByCreatedAtDesc(Integer farmerId);
}
