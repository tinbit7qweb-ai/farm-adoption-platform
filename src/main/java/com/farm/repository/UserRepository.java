package com.farm.repository;

import com.farm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // 1️⃣ 通过用户名找用户（用于登录）
    Optional<User> findByUsername(String username);

    // 2️⃣ 通过角色查找所有用户
    java.util.List<User> findByRole(String role);
}