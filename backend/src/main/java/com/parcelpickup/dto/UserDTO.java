package com.parcelpickup.dto;

import com.parcelpickup.entity.Role;
import com.parcelpickup.entity.User;
import lombok.Data;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class UserDTO {
    
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String realName;
    private String studentId;
    private String avatar;
    private Integer status;
    private Set<String> roles;
    
    public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRealName(user.getRealName());
        dto.setStudentId(user.getStudentId());
        dto.setAvatar(user.getAvatar());
        dto.setStatus(user.getStatus());
        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet()));
        }
        return dto;
    }
}
