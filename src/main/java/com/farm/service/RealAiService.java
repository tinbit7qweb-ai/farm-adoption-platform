package com.farm.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

@Service
public class RealAiService {

    @Value("${deepseek.api-key:}")
    private String apiKey;

    @Value("${deepseek.api-url:https://api.deepseek.com/chat/completions}")
    private String apiUrl;

    @Value("${deepseek.model:deepseek-chat}")
    private String model;

    public String chatWithAi(String userMessage, String context) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "请先输入你的问题。";
        }

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("你的新DeepSeek密钥")) {
            return fallbackAnswer(userMessage);
        }

        try {
            JsonObject body = new JsonObject();
            body.addProperty("model", model);
            body.addProperty("temperature", 0.8);
            body.addProperty("max_tokens", 800);

            JsonArray messages = new JsonArray();

            JsonObject system = new JsonObject();
            system.addProperty("role", "system");
            system.addProperty("content",
                    "你是社区共享农场认养平台中的智慧农业顾问。"
                            + "你的回答要自然、有亲和力，但不要太像机器人。"
                            + "你擅长回答作物种植周期、浇水、施肥、病虫害防治、土壤和日照建议。"
                            + "回答要结合农场认养场景，语言适合大学课程设计演示。"
                            + "不要说自己是ChatGPT，也不要暴露接口信息。"
            );
            messages.add(system);

            JsonObject user = new JsonObject();
            user.addProperty("role", "user");
            user.addProperty("content", userMessage);
            messages.add(user);

            body.add("messages", messages);

            URL url = new URL(apiUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(body.toString().getBytes(StandardCharsets.UTF_8));
            }

            int code = conn.getResponseCode();

            Scanner scanner;
            if (code >= 200 && code < 300) {
                scanner = new Scanner(conn.getInputStream(), StandardCharsets.UTF_8);
            } else {
                scanner = new Scanner(conn.getErrorStream(), StandardCharsets.UTF_8);
            }

            StringBuilder responseText = new StringBuilder();
            while (scanner.hasNextLine()) {
                responseText.append(scanner.nextLine());
            }
            scanner.close();

            if (code < 200 || code >= 300) {
                return "AI接口调用失败，状态码：" + code + "\n"
                        + "可能原因：密钥错误、余额不足、模型名称不支持。\n"
                        + "接口返回：" + responseText;
            }

            JsonObject json = JsonParser.parseString(responseText.toString()).getAsJsonObject();
            JsonArray choices = json.getAsJsonArray("choices");

            if (choices == null || choices.size() == 0) {
                return "AI没有返回有效内容，请再试一次。";
            }

            JsonObject message = choices.get(0)
                    .getAsJsonObject()
                    .getAsJsonObject("message");

            return message.get("content").getAsString();

        } catch (Exception e) {
            e.printStackTrace();
            return "AI调用出现异常：" + e.getMessage();
        }
    }

    private String fallbackAnswer(String userMessage) {
        if (userMessage.contains("时间") || userMessage.contains("周期") || userMessage.contains("多久")) {
            return "如果按常见作物周期看，苹果、葡萄、玫瑰、西瓜这类作物周期较长。"
                    + "例如苹果大约120天，葡萄大约90天，西瓜大约80天。"
                    + "如果你想体验更完整的认养过程，可以选择周期长一点的作物。";
        }

        if (userMessage.contains("番茄")) {
            return "番茄比较适合新手认养，生长周期大约60天。"
                    + "它喜欢充足光照，土壤保持湿润但不要积水，结果期可以适当补充磷钾肥。";
        }

        return "目前还没有配置真实DeepSeek密钥，所以我只能先用本地知识库回答。"
                + "配置密钥后，我就可以像真正AI一样自由对话。";
    }

    public String generatePlantDiary(String plantName, String cropType, int daysGrown, String currentStatus) {
        return chatWithAi(
                "请为一株叫" + plantName + "的" + cropType
                        + "写一段生长日记。已种植" + daysGrown
                        + "天，当前状态：" + currentStatus,
                null
        );
    }

    public String generateFarmImageDescription(String farmType, String cropName) {
        return chatWithAi(
                "请描述一个" + farmType + "场景，里面种植了" + cropName
                        + "，语言自然一点，适合放在农场认养平台页面中。",
                null
        );
    }
}