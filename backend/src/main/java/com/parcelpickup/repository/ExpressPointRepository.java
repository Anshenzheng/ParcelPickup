package com.parcelpickup.repository;

import com.parcelpickup.entity.ExpressPoint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpressPointRepository extends JpaRepository<ExpressPoint, Long> {
    
    List<ExpressPoint> findByStatus(Integer status);
    
    Page<ExpressPoint> findAll(Pageable pageable);
    
    Page<ExpressPoint> findByStatus(Integer status, Pageable pageable);
}
