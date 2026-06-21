package com.farm.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;

// 请求DTO
class DeepSeekChatReq {
    private String model;
    private List<Message> messages;
    private Integer maxTokens;
    private Double temperature;

    public static class Message {
        private String role;
        private String content;
        public Message(String r, String c) {role=r;content=c;}
        public String getRole(){return role;}
        public String getContent(){return content;}
    }
    // getter setter
    public String getModel(){return model;}
    public void setModel(String m){model=m;}
    public List<Message> getMessages(){return messages;}
    public void setMessages(List<Message> m){messages=m;}
    public Integer getMaxTokens(){return maxTokens;}
    public void setMaxTokens(Integer m){maxTokens=m;}
    public Double getTemperature(){return temperature;}
    public void setTemperature(Double t){temperature=t;}
}

// 响应DTO
class DeepSeekChatResp {
    private List<Choice> choices;
    public static class Choice {
        private Msg message;
        public static class Msg {
            private String content;
            public String getContent(){return content;}
        }
        public Msg getMessage(){return message;}
    }
    public List<Choice> getChoices(){return choices;}
}

@Service
public class DeepSeekAiService {
    @Value("${deepseek.api-key}")
    private String apiKey;
    @Value("${deepseek.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String SYSTEM_PROMPT = "你是智慧农场专属农事顾问，仅回答农作物种植、土壤、日照、病虫害、地块认养相关问题；回答通俗易懂，简短清晰，贴合家庭农场认养场景，不输出无关内容。";

    public String getRealAiReply(String userMsg) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        List<DeepSeekChatReq.Message> msgs = List.of(
                new DeepSeekChatReq.Message("system", SYSTEM_PROMPT),
                new DeepSeekChatReq.Message("user", userMsg)
        );
        DeepSeekChatReq req = new DeepSeekChatReq();
        req.setModel("deepseek-chat");
        req.setMessages(msgs);
        req.setMaxTokens(1024);
        req.setTemperature(0.6);

        HttpEntity<DeepSeekChatReq> entity = new HttpEntity<>(req, headers);
        String url = baseUrl + "/chat/completions";
        try {
            DeepSeekChatResp resp = restTemplate.postForObject(url, entity, DeepSeekChatResp.class);
            if(resp != null && resp.getChoices() != null && !resp.getChoices().isEmpty()){
                return resp.getChoices().get(0).getMessage().getContent();
            }
            return "农事顾问暂时未能生成回答，请稍后重试";
        }catch (Exception e){
            e.printStackTrace();
            return "AI接口请求异常，请检查配置或稍后再提问";
        }
    }
}