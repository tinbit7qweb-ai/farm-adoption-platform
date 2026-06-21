package com.farm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {
    // 1️⃣ 用户名
    private String username;

    // 2️⃣ 密码
    private String password;

    // 3️⃣ 真实姓名（注册时使用）
    private String realName;

    // 4️⃣ 用户角色（farmer 或 user）
    private String role;

    // 5️⃣ 电话号码
    private String phone;

    // 6️⃣ 邮箱
    private String email;
}