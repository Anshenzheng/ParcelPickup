package com.parcelpickup.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "parcel_logs")
public class ParcelLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "parcel_id", nullable = false)
    private Long parcelId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(nullable = false, length = 50)
    private String action;
    
    @Column(name = "old_status")
    private Integer oldStatus;
    
    @Column(name = "new_status")
    private Integer newStatus;
    
    @Column(columnDefinition = "TEXT")
    private String remark;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
