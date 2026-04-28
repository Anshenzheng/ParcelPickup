package com.parcelpickup.service;

import com.parcelpickup.common.Result;
import com.parcelpickup.entity.ExpressPoint;
import com.parcelpickup.repository.ExpressPointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ExpressPointService {
    
    @Autowired
    private ExpressPointRepository expressPointRepository;
    
    public List<ExpressPoint> findAllActive() {
        return expressPointRepository.findByStatus(1);
    }
    
    public Page<ExpressPoint> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return expressPointRepository.findAll(pageable);
    }
    
    public Optional<ExpressPoint> findById(Long id) {
        return expressPointRepository.findById(id);
    }
    
    @Transactional
    public Result<ExpressPoint> createExpressPoint(ExpressPoint expressPoint) {
        expressPoint.setStatus(1);
        ExpressPoint saved = expressPointRepository.save(expressPoint);
        return Result.success("快递点创建成功", saved);
    }
    
    @Transactional
    public Result<ExpressPoint> updateExpressPoint(Long id, ExpressPoint expressPoint) {
        Optional<ExpressPoint> existingOpt = expressPointRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return Result.error("快递点不存在");
        }
        
        ExpressPoint existing = existingOpt.get();
        existing.setName(expressPoint.getName());
        existing.setAddress(expressPoint.getAddress());
        existing.setContactPerson(expressPoint.getContactPerson());
        existing.setPhone(expressPoint.getPhone());
        existing.setOpenTime(expressPoint.getOpenTime());
        
        ExpressPoint saved = expressPointRepository.save(existing);
        return Result.success("快递点更新成功", saved);
    }
    
    @Transactional
    public Result<String> updateStatus(Long id, Integer status) {
        Optional<ExpressPoint> existingOpt = expressPointRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return Result.error("快递点不存在");
        }
        
        ExpressPoint existing = existingOpt.get();
        existing.setStatus(status);
        expressPointRepository.save(existing);
        
        return Result.success(status == 1 ? "快递点已启用" : "快递点已禁用", null);
    }
    
    @Transactional
    public Result<String> deleteExpressPoint(Long id) {
        if (!expressPointRepository.existsById(id)) {
            return Result.error("快递点不存在");
        }
        expressPointRepository.deleteById(id);
        return Result.success("快递点已删除", null);
    }
}
