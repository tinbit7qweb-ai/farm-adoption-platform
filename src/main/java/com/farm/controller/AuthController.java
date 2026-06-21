package com.farm.controller;

import com.farm.dto.ApiResponse;
import com.farm.dto.AuthRequest;
import com.farm.dto.UserResponse;
import com.farm.entity.User;
import com.farm.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody AuthRequest request) {
        try {
            User user = authService.register(
                    request.getUsername(),
                    request.getPassword(),
                    request.getRealName(),
                    request.getRole()
            );
            return ApiResponse.success("register success", UserResponse.from(user));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse<UserResponse> login(@RequestBody AuthRequest request) {
        try {
            User user = authService.login(request.getUsername(), request.getPassword());
            return ApiResponse.success("login success", UserResponse.from(user));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<UserResponse> getUserInfo(@PathVariable Integer userId) {
        try {
            User user = authService.getUserById(userId);
            return ApiResponse.success(UserResponse.from(user));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/user/{userId}")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable Integer userId,
            @RequestBody AuthRequest request) {
        try {
            User user = authService.updateUser(
                    userId,
                    request.getRealName(),
                    request.getPhone(),
                    request.getEmail()
            );
            return ApiResponse.success("update success", UserResponse.from(user));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout() {
        return ApiResponse.success("logout success");
    }

    @GetMapping("/check/{userId}")
    public ApiResponse<Boolean> checkLogin(@PathVariable Integer userId) {
        try {
            authService.getUserById(userId);
            return ApiResponse.success(true);
        } catch (Exception e) {
            return ApiResponse.success(false);
        }
    }
}
