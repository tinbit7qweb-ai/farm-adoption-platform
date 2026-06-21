package com.farm.repository;

import com.farm.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    // 1️⃣ 通过用户ID查找聊天记录
    @Query(value = "SELECT * FROM chat_message WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 50", nativeQuery = true)
    List<ChatMessage> findChatHistoryByUserId(Integer userId);

    // 2️⃣ 查找用户最近的聊天记录
    @Query(value = "SELECT * FROM chat_message WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?2", nativeQuery = true)
    List<ChatMessage> findRecentChats(Integer userId, Integer limit);
}