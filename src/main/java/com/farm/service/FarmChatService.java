package com.farm.service;

import com.farm.entity.FarmChatMessage;
import com.farm.repository.FarmChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FarmChatService {
    @Autowired
    private FarmChatMessageRepository farmChatMessageRepository;

    public FarmChatMessage sendMessage(Integer plotId, Integer orderId, Integer userId, Integer farmerId,
                                       String senderRole, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("消息内容不能为空");
        }

        FarmChatMessage message = new FarmChatMessage();
        message.setPlotId(plotId);
        message.setOrderId(orderId);
        message.setUserId(userId);
        message.setFarmerId(farmerId);
        message.setSenderRole(senderRole);
        message.setContent(content.trim());
        message.setReadByUser("user".equals(senderRole));
        message.setReadByFarmer("farmer".equals(senderRole));
        message.setCreatedAt(LocalDateTime.now());
        return farmChatMessageRepository.save(message);
    }

    public List<FarmChatMessage> getPlotMessages(Integer plotId) {
        return farmChatMessageRepository.findByPlotIdOrderByCreatedAtAsc(plotId);
    }

    public List<FarmChatMessage> getUserMessages(Integer userId) {
        return farmChatMessageRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<FarmChatMessage> getFarmerMessages(Integer farmerId) {
        return farmChatMessageRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public void markRead(Integer plotId, String viewerRole) {
        List<FarmChatMessage> messages = getPlotMessages(plotId);
        for (FarmChatMessage message : messages) {
            if ("user".equals(viewerRole)) {
                message.setReadByUser(true);
            }
            if ("farmer".equals(viewerRole)) {
                message.setReadByFarmer(true);
            }
        }
        farmChatMessageRepository.saveAll(messages);
    }
}
