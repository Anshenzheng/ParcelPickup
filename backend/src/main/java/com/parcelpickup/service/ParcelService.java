package com.parcelpickup.service;

import com.parcelpickup.common.Result;
import com.parcelpickup.dto.ParcelDTO;
import com.parcelpickup.entity.Parcel;
import com.parcelpickup.entity.ParcelLog;
import com.parcelpickup.entity.User;
import com.parcelpickup.repository.ParcelLogRepository;
import com.parcelpickup.repository.ParcelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ParcelService {
    
    @Autowired
    private ParcelRepository parcelRepository;
    
    @Autowired
    private ParcelLogRepository parcelLogRepository;
    
    @Autowired
    private UserService userService;
    
    private static final DateTimeFormatter ORDER_NO_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    
    public String generateOrderNo() {
        String timestamp = LocalDateTime.now().format(ORDER_NO_FORMATTER);
        String random = String.format("%04d", new Random().nextInt(10000));
        return "PP" + timestamp + random;
    }
    
    @Transactional
    public Result<Parcel> createParcel(ParcelDTO parcelDTO) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return Result.error("用户未登录");
        }
        
        Parcel parcel = new Parcel();
        parcel.setOrderNo(generateOrderNo());
        parcel.setPublisherId(currentUser.getId());
        parcel.setExpressPointId(parcelDTO.getExpressPointId());
        parcel.setPickupCode(parcelDTO.getPickupCode());
        parcel.setDeliveryAddress(parcelDTO.getDeliveryAddress());
        parcel.setContactPerson(parcelDTO.getContactPerson());
        parcel.setContactPhone(parcelDTO.getContactPhone());
        parcel.setReward(parcelDTO.getReward());
        parcel.setParcelType(parcelDTO.getParcelType());
        parcel.setWeight(parcelDTO.getWeight());
        parcel.setRemark(parcelDTO.getRemark());
        parcel.setStatus(Parcel.STATUS_PENDING_REVIEW);
        
        Parcel saved = parcelRepository.save(parcel);
        createLog(saved.getId(), currentUser.getId(), "发布订单", null, Parcel.STATUS_PENDING_REVIEW, "用户发布快递代取订单");
        
        return Result.success("订单发布成功", saved);
    }
    
    public Page<Parcel> findAllParcels(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return parcelRepository.findAll(pageable);
    }
    
    public Page<Parcel> findAvailableParcels(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        List<Integer> visibleStatuses = Arrays.asList(Parcel.STATUS_PENDING_ACCEPT);
        return parcelRepository.findByStatusIn(visibleStatuses, pageable);
    }
    
    public Page<Parcel> findParcelsByStatus(Integer status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return parcelRepository.findByStatus(status, pageable);
    }
    
    public Page<Parcel> findMyPublishedParcels(Integer status, int page, int size) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return Page.empty();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null) {
            return parcelRepository.findByPublisherIdAndStatus(currentUser.getId(), status, pageable);
        }
        return parcelRepository.findByPublisherId(currentUser.getId(), pageable);
    }
    
    public Page<Parcel> findMyAcceptedParcels(Integer status, int page, int size) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return Page.empty();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null) {
            return parcelRepository.findByAcceptorIdAndStatus(currentUser.getId(), status, pageable);
        }
        return parcelRepository.findByAcceptorId(currentUser.getId(), pageable);
    }
    
    public Optional<Parcel> findById(Long id) {
        return parcelRepository.findById(id);
    }
    
    @Transactional
    public Result<Parcel> acceptParcel(Long parcelId) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return Result.error("用户未登录");
        }
        
        Optional<Parcel> parcelOpt = parcelRepository.findById(parcelId);
        if (parcelOpt.isEmpty()) {
            return Result.error("订单不存在");
        }
        
        Parcel parcel = parcelOpt.get();
        
        if (parcel.getPublisherId().equals(currentUser.getId())) {
            return Result.error("不能接自己发布的订单");
        }
        
        if (parcel.getStatus() != Parcel.STATUS_PENDING_ACCEPT) {
            return Result.error("订单状态不允许接单");
        }
        
        if (parcel.getAcceptorId() != null) {
            return Result.error("订单已被他人接单");
        }
        
        int oldStatus = parcel.getStatus();
        parcel.setAcceptorId(currentUser.getId());
        parcel.setStatus(Parcel.STATUS_ACCEPTED);
        parcel.setAcceptedAt(LocalDateTime.now());
        
        Parcel saved = parcelRepository.save(parcel);
        createLog(saved.getId(), currentUser.getId(), "接单", oldStatus, Parcel.STATUS_ACCEPTED, "用户成功接单");
        
        return Result.success("接单成功", saved);
    }
    
    @Transactional
    public Result<Parcel> startDelivery(Long parcelId) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return Result.error("用户未登录");
        }
        
        Optional<Parcel> parcelOpt = parcelRepository.findById(parcelId);
        if (parcelOpt.isEmpty()) {
            return Result.error("订单不存在");
        }
        
        Parcel parcel = parcelOpt.get();
        
        if (!currentUser.getId().equals(parcel.getAcceptorId())) {
            return Result.error("只能处理自己接的订单");
        }
        
        if (parcel.getStatus() != Parcel.STATUS_ACCEPTED) {
            return Result.error("订单状态不允许开始配送");
        }
        
        int oldStatus = parcel.getStatus();
        parcel.setStatus(Parcel.STATUS_DELIVERING);
        parcel.setDeliveredAt(LocalDateTime.now());
        
        Parcel saved = parcelRepository.save(parcel);
        createLog(saved.getId(), currentUser.getId(), "开始配送", oldStatus, Parcel.STATUS_DELIVERING, "用户开始配送");
        
        return Result.success("已开始配送", saved);
    }
    
    @Transactional
    public Result<Parcel> completeParcel(Long parcelId) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return Result.error("用户未登录");
        }
        
        Optional<Parcel> parcelOpt = parcelRepository.findById(parcelId);
        if (parcelOpt.isEmpty()) {
            return Result.error("订单不存在");
        }
        
        Parcel parcel = parcelOpt.get();
        
        if (!currentUser.getId().equals(parcel.getAcceptorId())) {
            return Result.error("只能完成自己接的订单");
        }
        
        if (parcel.getStatus() != Parcel.STATUS_DELIVERING) {
            return Result.error("订单状态不允许完成");
        }
        
        int oldStatus = parcel.getStatus();
        parcel.setStatus(Parcel.STATUS_COMPLETED);
        parcel.setCompletedAt(LocalDateTime.now());
        
        Parcel saved = parcelRepository.save(parcel);
        createLog(saved.getId(), currentUser.getId(), "完成订单", oldStatus, Parcel.STATUS_COMPLETED, "用户完成订单配送");
        
        return Result.success("订单已完成", saved);
    }
    
    @Transactional
    public Result<Parcel> cancelParcel(Long parcelId, String reason) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return Result.error("用户未登录");
        }
        
        Optional<Parcel> parcelOpt = parcelRepository.findById(parcelId);
        if (parcelOpt.isEmpty()) {
            return Result.error("订单不存在");
        }
        
        Parcel parcel = parcelOpt.get();
        
        if (!currentUser.getId().equals(parcel.getPublisherId())) {
            return Result.error("只能取消自己发布的订单");
        }
        
        if (parcel.getStatus() >= Parcel.STATUS_ACCEPTED) {
            return Result.error("订单已被接单，无法取消");
        }
        
        int oldStatus = parcel.getStatus();
        parcel.setStatus(Parcel.STATUS_CANCELLED);
        parcel.setCancelledAt(LocalDateTime.now());
        
        Parcel saved = parcelRepository.save(parcel);
        createLog(saved.getId(), currentUser.getId(), "取消订单", oldStatus, Parcel.STATUS_CANCELLED, "用户取消订单: " + reason);
        
        return Result.success("订单已取消", saved);
    }
    
    @Transactional
    public Result<Parcel> reviewParcel(Long parcelId, boolean approved, String adminRemark) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return Result.error("用户未登录");
        }
        
        Optional<Parcel> parcelOpt = parcelRepository.findById(parcelId);
        if (parcelOpt.isEmpty()) {
            return Result.error("订单不存在");
        }
        
        Parcel parcel = parcelOpt.get();
        
        if (parcel.getStatus() != Parcel.STATUS_PENDING_REVIEW) {
            return Result.error("订单状态不允许审核");
        }
        
        int oldStatus = parcel.getStatus();
        parcel.setReviewedBy(currentUser.getId());
        parcel.setReviewedAt(LocalDateTime.now());
        parcel.setAdminRemark(adminRemark);
        
        if (approved) {
            parcel.setStatus(Parcel.STATUS_PENDING_ACCEPT);
            createLog(parcel.getId(), currentUser.getId(), "审核通过", oldStatus, Parcel.STATUS_PENDING_ACCEPT, adminRemark);
        } else {
            parcel.setStatus(Parcel.STATUS_REMOVED);
            createLog(parcel.getId(), currentUser.getId(), "审核不通过", oldStatus, Parcel.STATUS_REMOVED, adminRemark);
        }
        
        Parcel saved = parcelRepository.save(parcel);
        return Result.success(approved ? "审核通过" : "审核不通过", saved);
    }
    
    @Transactional
    public Result<Parcel> removeParcel(Long parcelId, String reason) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return Result.error("用户未登录");
        }
        
        Optional<Parcel> parcelOpt = parcelRepository.findById(parcelId);
        if (parcelOpt.isEmpty()) {
            return Result.error("订单不存在");
        }
        
        Parcel parcel = parcelOpt.get();
        
        if (parcel.getStatus() == Parcel.STATUS_COMPLETED || 
            parcel.getStatus() == Parcel.STATUS_CANCELLED || 
            parcel.getStatus() == Parcel.STATUS_REMOVED) {
            return Result.error("订单已结束，无法下架");
        }
        
        int oldStatus = parcel.getStatus();
        parcel.setStatus(Parcel.STATUS_REMOVED);
        parcel.setAdminRemark(reason);
        
        Parcel saved = parcelRepository.save(parcel);
        createLog(saved.getId(), currentUser.getId(), "管理员下架", oldStatus, Parcel.STATUS_REMOVED, reason);
        
        return Result.success("订单已下架", saved);
    }
    
    private void createLog(Long parcelId, Long userId, String action, Integer oldStatus, Integer newStatus, String remark) {
        ParcelLog log = new ParcelLog();
        log.setParcelId(parcelId);
        log.setUserId(userId);
        log.setAction(action);
        log.setOldStatus(oldStatus);
        log.setNewStatus(newStatus);
        log.setRemark(remark);
        parcelLogRepository.save(log);
    }
    
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalParcels", parcelRepository.count());
        stats.put("pendingReview", parcelRepository.countByStatus(Parcel.STATUS_PENDING_REVIEW));
        stats.put("pendingAccept", parcelRepository.countByStatus(Parcel.STATUS_PENDING_ACCEPT));
        stats.put("accepted", parcelRepository.countByStatus(Parcel.STATUS_ACCEPTED));
        stats.put("delivering", parcelRepository.countByStatus(Parcel.STATUS_DELIVERING));
        stats.put("completed", parcelRepository.countByStatus(Parcel.STATUS_COMPLETED));
        stats.put("cancelled", parcelRepository.countByStatus(Parcel.STATUS_CANCELLED));
        stats.put("removed", parcelRepository.countByStatus(Parcel.STATUS_REMOVED));
        
        long total = parcelRepository.count();
        long completed = parcelRepository.countByStatus(Parcel.STATUS_COMPLETED);
        double completionRate = total > 0 ? (double) completed / total * 100 : 0;
        stats.put("completionRate", String.format("%.2f%%", completionRate));
        
        return stats;
    }
    
    public Map<String, Object> getDailyStatistics(int days) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> dailyData = new ArrayList<>();
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("newOrders", parcelRepository.countByCreatedAtBetween(start, end));
            dayData.put("completedOrders", parcelRepository.countCompletedByDateRange(Parcel.STATUS_COMPLETED, start, end));
            
            Double rewards = parcelRepository.sumRewardsByDateRange(Parcel.STATUS_COMPLETED, start, end);
            dayData.put("totalRewards", rewards != null ? rewards : 0.0);
            
            dailyData.add(dayData);
        }
        
        result.put("dailyData", dailyData);
        return result;
    }
    
    public List<ParcelLog> getParcelLogs(Long parcelId) {
        return parcelLogRepository.findByParcelIdOrderByCreatedAtDesc(parcelId);
    }
}
