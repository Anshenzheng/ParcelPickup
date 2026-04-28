package com.parcelpickup.repository;

import com.parcelpickup.entity.ParcelLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParcelLogRepository extends JpaRepository<ParcelLog, Long> {
    
    List<ParcelLog> findByParcelIdOrderByCreatedAtDesc(Long parcelId);
    
    Page<ParcelLog> findByParcelId(Long parcelId, Pageable pageable);
    
    Page<ParcelLog> findByUserId(Long userId, Pageable pageable);
}
