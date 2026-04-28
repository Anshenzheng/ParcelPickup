package com.parcelpickup.service;

import com.parcelpickup.common.Result;
import com.parcelpickup.dto.JwtResponse;
import com.parcelpickup.dto.LoginDTO;
import com.parcelpickup.dto.RegisterDTO;
import com.parcelpickup.dto.UserDTO;
import com.parcelpickup.entity.Role;
import com.parcelpickup.entity.User;
import com.parcelpickup.repository.RoleRepository;
import com.parcelpickup.repository.UserRepository;
import com.parcelpickup.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }
    
    @Transactional
    public Result<JwtResponse> login(LoginDTO loginDTO) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByUsername(loginDTO.getUsername()).orElse(null);
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        Set<String> roles = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toSet());
        
        JwtResponse response = new JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), roles);
        return Result.success("登录成功", response);
    }
    
    @Transactional
    public Result<String> register(RegisterDTO registerDTO) {
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            return Result.error("用户名已存在");
        }
        
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            return Result.error("邮箱已被注册");
        }
        
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setEmail(registerDTO.getEmail());
        user.setPhone(registerDTO.getPhone());
        user.setRealName(registerDTO.getRealName());
        user.setStudentId(registerDTO.getStudentId());
        user.setStatus(1);
        
        Role userRole = roleRepository.findByName("ROLE_USER")
            .orElseThrow(() -> new RuntimeException("角色不存在"));
        user.setRoles(new HashSet<>(Collections.singletonList(userRole)));
        
        userRepository.save(user);
        
        return Result.success("注册成功", null);
    }
    
    public Page<User> findAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findAll(pageable);
    }
    
    public Page<User> findUsersByStatus(Integer status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findByStatus(status, pageable);
    }
    
    @Transactional
    public Result<User> updateUserStatus(Long userId, Integer status) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Result.error("用户不存在");
        }
        
        User user = userOpt.get();
        user.setStatus(status);
        userRepository.save(user);
        
        return Result.success(user);
    }
    
    public UserDTO getUserDTO(User user) {
        return UserDTO.fromEntity(user);
    }
}
