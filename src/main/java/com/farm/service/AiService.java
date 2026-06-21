package com.farm.service;

import com.farm.entity.AiSuggestion;
import com.farm.entity.ChatMessage;
import com.farm.entity.CropType;
import com.farm.entity.AdoptionOrder;
import com.farm.repository.AiSuggestionRepository;
import com.farm.repository.ChatMessageRepository;
import com.farm.repository.CropTypeRepository;
import com.farm.repository.AdoptionOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AiService {
    @Autowired
    private AiSuggestionRepository aiSuggestionRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private CropTypeRepository cropTypeRepository;

    @Autowired
    private AdoptionOrderRepository adoptionOrderRepository;

    // 新增：注入DeepSeek真实API服务
    @Autowired
    private DeepSeekAiService deepSeekAiService;

    // ========== 【AI 种植建议模块】==========

    // 1️⃣ 生成种植建议
    public String generatePlantingSuggestion(Integer cropId, String soilType, Integer sunlightHours) {
        Optional<CropType> crop = cropTypeRepository.findById(cropId);
        if (!crop.isPresent()) {
            return "作物不存在！";
        }

        CropType cropType = crop.get();
        StringBuilder suggestion = new StringBuilder();

        suggestion.append("【").append(cropType.getCropName()).append(" 种植建议】\n\n");

        // 基于土壤类型的建议
        suggestion.append("🌱 土壤管理：\n");
        if ("黑土".equals(soilType)) {
            suggestion.append("  ✓ 您的地块是黑土，养分丰富，非常适合种植 ").append(cropType.getCropName()).append("\n");
            suggestion.append("  ✓ 建议每月检查一次土壤含水量\n");
        } else if ("红土".equals(soilType)) {
            suggestion.append("  ✓ 您的地块是红土，建议适当补充有机肥\n");
            suggestion.append("  ✓ 红土保水性强，浇水时要注意排水\n");
        } else {
            suggestion.append("  ✓ 建议根据土壤成分选择合适的肥料\n");
        }

        // 基于日照的建议
        suggestion.append("\n☀️ 光照管理：\n");
        if (sunlightHours >= 8) {
            suggestion.append("  ✓ 您的地块日照充足（").append(sunlightHours).append("小时/天）\n");
            suggestion.append("  ✓ 非常适合 ").append(cropType.getCropName()).append("\n");
        } else if (sunlightHours >= 6) {
            suggestion.append("  ✓ 日照充足（").append(sunlightHours).append("小时/天）\n");
            suggestion.append("  ✓ 适合种植 ").append(cropType.getCropName()).append("\n");
        } else {
            suggestion.append("  ⚠ 日照不足（").append(sunlightHours).append("小时/天）\n");
            suggestion.append("  ✓ 建议选择耐阴作物\n");
        }

        // 基于作物属性的建议
        suggestion.append("\n💧 浇水管理：\n");
        suggestion.append("  ✓ ").append(cropType.getCropName()).append(" 的水分需求：").append(cropType.getWaterRequirement()).append("\n");
        suggestion.append("  ✓ 建议每3-5天检查一次土壤湿度\n");

        suggestion.append("\n🌡️ 温度管理：\n");
        suggestion.append("  ✓ 适宜温度范围：").append(cropType.getTemperatureRange()).append("\n");
        suggestion.append("  ✓ 注意冬季保温，夏季降温\n");

        suggestion.append("\n⏱️ 生长周期：\n");
        suggestion.append("  ✓ 从播种到收获约需 ").append(cropType.getGrowthDays()).append(" 天\n");

        return suggestion.toString();
    }

    // 2️⃣ 生成生长预测
    public String generateGrowthPrediction(Integer cropId, Integer daysGrown) {
        Optional<CropType> crop = cropTypeRepository.findById(cropId);
        if (!crop.isPresent()) {
            return "作物不存在！";
        }

        CropType cropType = crop.get();
        Integer totalDays = cropType.getGrowthDays();
        Double progress = (double) daysGrown / totalDays * 100;

        StringBuilder prediction = new StringBuilder();
        prediction.append("【").append(cropType.getCropName()).append(" 生长预测】\n\n");
        prediction.append("已种植天数：").append(daysGrown).append(" 天\n");
        prediction.append("总生长周期：").append(totalDays).append(" 天\n");
        prediction.append("生长进度：").append(String.format("%.1f", progress)).append("%\n\n");

        // 根据生长进度给出不同阶段的建议
        if (progress < 25) {
            prediction.append("📌 【萌芽期】\n");
            prediction.append("  ✓ 保持土壤湿润，不要过干或过湿\n");
            prediction.append("  ✓ 早期不需要过多浇水\n");
            prediction.append("  ✓ 避免强风直吹\n");
        } else if (progress < 50) {
            prediction.append("📌 【幼苗期】\n");
            prediction.append("  ✓ 逐步增加浇水量\n");
            prediction.append("  ✓ 开始进行适度施肥\n");
            prediction.append("  ✓ 可以进行间苗\n");
        } else if (progress < 75) {
            prediction.append("📌 【生长期】\n");
            prediction.append("  ✓ 保证充足的水分和养分\n");
            prediction.append("  ✓ 每2周施肥一次\n");
            prediction.append("  ✓ 注意防治病虫害\n");
        } else if (progress < 90) {
            prediction.append("📌 【成熟期】\n");
            prediction.append("  ✓ 减少浇水，促进果实成熟\n");
            prediction.append("  ✓ 停止施肥\n");
            prediction.append("  ✓ 准备采收工具\n");
        } else {
            prediction.append("📌 【收获期】\n");
            prediction.append("  ✓ 即将可以采收！\n");
            prediction.append("  ✓ 选择清晨采收效果最好\n");
            prediction.append("  ✓ 采收后及时处理和保存\n");
        }

        // 计算预计收获日期
        Integer remainingDays = totalDays - daysGrown;
        prediction.append("\n⏰ 预计还需 ").append(remainingDays).append(" 天可以采收\n");

        return prediction.toString();
    }

    // 3️⃣ 生成防病防虫建议
    public String generatePestPreventionAdvice(Integer cropId, String season) {
        Optional<CropType> crop = cropTypeRepository.findById(cropId);
        if (!crop.isPresent()) {
            return "作物不存在！";
        }

        CropType cropType = crop.get();
        StringBuilder advice = new StringBuilder();

        advice.append("【").append(cropType.getCropName()).append(" - ").append(season).append("季防病防虫建议】\n\n");

        if ("春季".equals(season)) {
            advice.append("🐛 【春季病虫害预防】\n");
            advice.append("  ✓ 常见病害：早疫病、晚疫病\n");
            advice.append("  ✓ 常见虫害：蚜虫、红蜘蛛\n");
            advice.append("  ✓ 建议：定期喷洒生物农药，每10天一次\n");
            advice.append("  ✓ 加强田间管理，清除病叶\n");
        } else if ("夏季".equals(season)) {
            advice.append("🐛 【夏季病虫害预防】\n");
            advice.append("  ✓ 常见病害：炭疽病、叶斑病\n");
            advice.append("  ✓ 常见虫害：飞虱、稻纵卷叶螟\n");
            advice.append("  ✓ 建议：增强通风，降低湿度\n");
            advice.append("  ✓ 使用物理防治（黄粘板、纱网）\n");
        } else if ("秋季".equals(season)) {
            advice.append("🐛 【秋季病虫害预防】\n");
            advice.append("  ✓ 常见病害：根腐病、白粉病\n");
            advice.append("  ✓ 常见虫害：地下害虫\n");
            advice.append("  ✓ 建议：改善排水条件\n");
            advice.append("  ✓ 使用有机肥增强植株抵抗力\n");
        } else {
            advice.append("🐛 【冬季病虫害预防】\n");
            advice.append("  ✓ 冬季病虫害较少，重点做好防冻\n");
            advice.append("  ✓ 清理田间落叶，减少病源\n");
        }

        return advice.toString();
    }

    // 4️⃣ 保存 AI 建议到数据库
    public AiSuggestion saveAiSuggestion(Integer orderId, Integer cropId, String suggestionText, String suggestionType) {
        AiSuggestion suggestion = new AiSuggestion();
        suggestion.setOrderId(orderId);
        suggestion.setCropId(cropId);
        suggestion.setSuggestionText(suggestionText);
        suggestion.setSuggestionType(suggestionType);
        suggestion.setCreatedAt(LocalDateTime.now());

        return aiSuggestionRepository.save(suggestion);
    }

    // 5️⃣ 获取某订单的所有 AI 建议
    public List<AiSuggestion> getOrderSuggestions(Integer orderId) {
        return aiSuggestionRepository.findByOrderId(orderId);
    }

    // ========== 【AI 聊天机器人模块】==========

    // 6️⃣ AI 聊天机器人（对接真实DeepSeek大模型API）
    public String chatWithAi(Integer userId, String userMessage) {
        // 调用真实DeepSeek接口，不再使用本地关键词匹配
        String aiResponse = deepSeekAiService.getRealAiReply(userMessage);

        // 保存聊天记录逻辑不变
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUserId(userId);
        chatMessage.setMessageText(userMessage);
        chatMessage.setAiResponse(aiResponse);
        chatMessage.setCreatedAt(LocalDateTime.now());

        chatMessageRepository.save(chatMessage);

        return aiResponse;
    }

    // 已完全删除旧的本地关键词匹配方法 generateAiResponse

    // 8️⃣ 获取用户的聊天历史
    public List<ChatMessage> getChatHistory(Integer userId) {
        return chatMessageRepository.findChatHistoryByUserId(userId);
    }
}