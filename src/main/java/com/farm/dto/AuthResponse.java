package com.farm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    // 1️⃣ 响应代码（200 成功，400 失败）
    private Integer code;

    // 2️⃣ 响应消息
    private String message;

    // 3️⃣ 用户 ID
    private Integer userId;

    // 4️⃣ 用户名
    private String username;

    // 5️⃣ 真实姓名
    private String realName;

    // 6️⃣ 用户角色
    private String role;

    // 7️⃣ 数据对象
    private Object data;

    // 便捷构造方法
    public static AuthResponse success(String message) {
        return new AuthResponse(200, message, null, null, null, null, null);
    }

    public static AuthResponse success(String message, Object data) {
        return new AuthResponse(200, message, null, null, null, null, data);
    }

    public static AuthResponse error(String message) {
        return new AuthResponse(400, message, null, null, null, null, null);
    }
}