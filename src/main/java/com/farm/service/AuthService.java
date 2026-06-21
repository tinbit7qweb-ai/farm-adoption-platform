package com.farm.service;

import com.farm.entity.User;
import com.farm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    // 1️⃣ 用户注册
    public User register(String username, String password, String realName, String role) {
        // 检查用户名是否已存在
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            throw new RuntimeException("用户名已存在！");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // 实际应用中应该加密！
        user.setRealName(realName);
        user.setRole(role != null ? role : "user");

        return userRepository.save(user);
    }

    // 2️⃣ 用户登录
    public User login(String username, String password) {
        Optional<User> user = userRepository.findByUsername(username);

        if (!user.isPresent()) {
            throw new RuntimeException("用户不存在！");
        }

        if (!user.get().getPassword().equals(password)) {
            throw new RuntimeException("密码错误！");
        }

        return user.get();
    }

    // 3️⃣ 获取用户信息
    public User getUserById(Integer userId) {
        Optional<User> user = userRepository.findById(userId);
        if (!user.isPresent()) {
            throw new RuntimeException("用户不存在！");
        }
        return user.get();
    }

    // 4️⃣ 更新用户信息
    public User updateUser(Integer userId, String realName, String phone, String email) {
        User user = getUserById(userId);
        user.setRealName(realName);
        user.setPhone(phone);
        user.setEmail(email);
        return userRepository.save(user);
    }
}