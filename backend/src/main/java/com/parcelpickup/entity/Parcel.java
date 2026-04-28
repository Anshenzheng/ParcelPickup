package com.parcelpickup.entity;

import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "parcels")
public class Parcel {
    
    public static final int STATUS_PENDING_REVIEW = 0;
    public static final int STATUS_PENDING_ACCEPT = 1;
    public static final int STATUS_ACCEPTED = 2;
    public static final int STATUS_DELIVERING = 3;
    public static final int STATUS_COMPLETED = 4;
    public static final int STATUS_CANCELLED = 5;
    public static final int STATUS_REMOVED = 6;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_no", unique = true, nullable = false, length = 50)
    private String orderNo;
    
    @Column(name = "publisher_id", nullable = false)
    private Long publisherId;
    
    @Column(name = "acceptor_id")
    private Long acceptorId;
    
    @Column(name = "express_point_id", nullable = false)
    private Long expressPointId;
    
    @Column(name = "pickup_code", nullable = false, length = 50)
    private String pickupCode;
    
    @Column(name = "delivery_address", nullable = false, length = 255)
    private String deliveryAddress;
    
    @Column(name = "contact_person", nullable = false, length = 50)
    private String contactPerson;
    
    @Column(name = "contact_phone", nullable = false, length = 20)
    private String contactPhone;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal reward;
    
    @Column(name = "parcel_type", length = 50)
    private String parcelType;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal weight;
    
    @Column(columnDefinition = "TEXT")
    private String remark;
    
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer status;
    
    @Column(name = "admin_remark", columnDefinition = "TEXT")
    private String adminRemark;
    
    @Column(name = "reviewed_by")
    private Long reviewedBy;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;
    
    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "publisher_id", insertable = false, updatable = false)
    private User publisher;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "acceptor_id", insertable = false, updatable = false)
    private User acceptor;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "express_point_id", insertable = false, updatable = false)
    private ExpressPoint expressPoint;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = STATUS_PENDING_REVIEW;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public String getStatusName() {
        if (status == null) return "未知";
        switch (status) {
            case STATUS_PENDING_REVIEW: return "待审核";
            case STATUS_PENDING_ACCEPT: return "待接单";
            case STATUS_ACCEPTED: return "已接单";
            case STATUS_DELIVERING: return "配送中";
            case STATUS_COMPLETED: return "已完成";
            case STATUS_CANCELLED: return "已取消";
            case STATUS_REMOVED: return "已下架";
            default: return "未知";
        }
    }
}
