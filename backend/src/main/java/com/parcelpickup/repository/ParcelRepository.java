package com.parcelpickup.repository;

import com.parcelpickup.entity.Parcel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParcelRepository extends JpaRepository<Parcel, Long> {
    
    Optional<Parcel> findByOrderNo(String orderNo);
    
    Page<Parcel> findByPublisherId(Long publisherId, Pageable pageable);
    
    Page<Parcel> findByAcceptorId(Long acceptorId, Pageable pageable);
    
    Page<Parcel> findByStatus(Integer status, Pageable pageable);
    
    Page<Parcel> findByPublisherIdAndStatus(Long publisherId, Integer status, Pageable pageable);
    
    Page<Parcel> findByAcceptorIdAndStatus(Long acceptorId, Integer status, Pageable pageable);
    
    @Query("SELECT p FROM Parcel p WHERE p.status IN :statuses ORDER BY p.createdAt DESC")
    Page<Parcel> findByStatusIn(@Param("statuses") List<Integer> statuses, Pageable pageable);
    
    long countByStatus(Integer status);
    
    long countByPublisherIdAndStatus(Long publisherId, Integer status);
    
    long countByAcceptorIdAndStatus(Long acceptorId, Integer status);
    
    @Query("SELECT COUNT(p) FROM Parcel p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(p) FROM Parcel p WHERE p.status = :completedStatus AND p.completedAt BETWEEN :startDate AND :endDate")
    long countCompletedByDateRange(@Param("completedStatus") Integer completedStatus, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COALESCE(SUM(p.reward), 0) FROM Parcel p WHERE p.status = :completedStatus AND p.completedAt BETWEEN :startDate AND :endDate")
    Double sumRewardsByDateRange(@Param("completedStatus") Integer completedStatus, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(p) FROM Parcel p WHERE p.acceptorId = :acceptorId AND p.status IN :statuses")
    long countByAcceptorIdAndStatusIn(@Param("acceptorId") Long acceptorId, @Param("statuses") List<Integer> statuses);
    
    @Query("SELECT p FROM Parcel p WHERE p.status IN :visibleStatuses AND p.acceptorId IS NULL ORDER BY p.createdAt DESC")
    Page<Parcel> findAvailableParcels(@Param("visibleStatuses") List<Integer> visibleStatuses, Pageable pageable);
}
