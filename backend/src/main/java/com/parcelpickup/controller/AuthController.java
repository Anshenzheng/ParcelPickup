package com.parcelpickup.controller;

import com.parcelpickup.common.Result;
import com.parcelpickup.dto.JwtResponse;
import com.parcelpickup.dto.LoginDTO;
import com.parcelpickup.dto.RegisterDTO;
import com.parcelpickup.dto.UserDTO;
import com.parcelpickup.entity.User;
import com.parcelpickup.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/login")
    public Result<JwtResponse> login(@Valid @RequestBody LoginDTO loginDTO) {
        return userService.login(loginDTO);
    }
    
    @PostMapping("/register")
    public Result<String> register(@Valid @RequestBody RegisterDTO registerDTO) {
        return userService.register(registerDTO);
    }
    
    @GetMapping("/me")
    public Result<UserDTO> getCurrentUser() {
        User user = userService.getCurrentUser();
        if (user == null) {
            return Result.error(401, "未登录");
        }
        return Result.success(userService.getUserDTO(user));
    }
    
    @GetMapping("/check-username")
    public Result<Boolean> checkUsername(@RequestParam String username) {
        boolean exists = userService.findByUsername(username).isPresent();
        return Result.success(exists);
    }
}
