package com.parcelpickup.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.parcelpickup.common.PageResult;
import com.parcelpickup.common.Result;
import com.parcelpickup.dto.UserDTO;
import com.parcelpickup.entity.Parcel;
import com.parcelpickup.entity.User;
import com.parcelpickup.service.ParcelService;
import com.parcelpickup.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private ParcelService parcelService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/parcels")
    public Result<PageResult<Parcel>> getAllParcels(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Parcel> parcels;
        if (status != null) {
            parcels = parcelService.findParcelsByStatus(status, page, size);
        } else {
            parcels = parcelService.findAllParcels(page, size);
        }
        return Result.success(PageResult.of(parcels));
    }
    
    @PostMapping("/parcels/{id}/review")
    public Result<Parcel> reviewParcel(
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam(required = false) String remark) {
        if (remark == null) remark = approved ? "审核通过" : "审核不通过";
        return parcelService.reviewParcel(id, approved, remark);
    }
    
    @PostMapping("/parcels/{id}/remove")
    public Result<Parcel> removeParcel(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        if (reason == null) reason = "管理员下架";
        return parcelService.removeParcel(id, reason);
    }
    
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = parcelService.getStatistics();
        return Result.success(stats);
    }
    
    @GetMapping("/daily-statistics")
    public Result<Map<String, Object>> getDailyStatistics(
            @RequestParam(defaultValue = "7") int days) {
        Map<String, Object> stats = parcelService.getDailyStatistics(days);
        return Result.success(stats);
    }
    
    @GetMapping("/users")
    public Result<PageResult<UserDTO>> getAllUsers(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<User> users;
        if (status != null) {
            users = userService.findUsersByStatus(status, page, size);
        } else {
            users = userService.findAllUsers(page, size);
        }
        
        Page<UserDTO> userDTOPage = users.map(UserDTO::fromEntity);
        return Result.success(PageResult.of(userDTOPage));
    }
    
    @PutMapping("/users/{id}/status")
    public Result<User> updateUserStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {
        return userService.updateUserStatus(id, status);
    }
    
    @GetMapping("/export/parcels")
    public ResponseEntity<byte[]> exportParcels(
            @RequestParam(required = false) Integer status) {
        Page<Parcel> parcels;
        if (status != null) {
            parcels = parcelService.findParcelsByStatus(status, 0, 10000);
        } else {
            parcels = parcelService.findAllParcels(0, 10000);
        }
        
        List<Parcel> parcelList = parcels.getContent();
        
        StringBuilder csv = new StringBuilder();
        csv.append("订单号,发布者,接单者,快递点,送达地点,酬劳,状态,创建时间\n");
        
        for (Parcel parcel : parcelList) {
            csv.append(parcel.getOrderNo()).append(",");
            csv.append(parcel.getPublisher() != null ? parcel.getPublisher().getUsername() : "").append(",");
            csv.append(parcel.getAcceptor() != null ? parcel.getAcceptor().getUsername() : "").append(",");
            csv.append(parcel.getExpressPoint() != null ? parcel.getExpressPoint().getName() : "").append(",");
            csv.append(parcel.getDeliveryAddress()).append(",");
            csv.append(parcel.getReward()).append(",");
            csv.append(parcel.getStatusName()).append(",");
            csv.append(parcel.getCreatedAt()).append("\n");
        }
        
        byte[] data = csv.toString().getBytes(StandardCharsets.UTF_8);
        String fileName = "parcels_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .body(data);
    }
    
    @GetMapping("/export/statistics")
    public ResponseEntity<byte[]> exportStatistics() {
        Map<String, Object> stats = parcelService.getStatistics();
        Map<String, Object> dailyStats = parcelService.getDailyStatistics(30);
        
        Map<String, Object> exportData = new HashMap<>();
        exportData.put("statistics", stats);
        exportData.put("dailyStatistics", dailyStats);
        
        String json = JSON.toJSONString(exportData, SerializerFeature.PrettyFormat, SerializerFeature.WriteDateUseDateFormat);
        byte[] data = json.getBytes(StandardCharsets.UTF_8);
        String fileName = "statistics_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + ".json";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(MediaType.parseMediaType("application/json;charset=UTF-8"))
                .body(data);
    }
}
