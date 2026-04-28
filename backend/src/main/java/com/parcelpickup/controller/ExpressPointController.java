package com.parcelpickup.controller;

import com.parcelpickup.common.PageResult;
import com.parcelpickup.common.Result;
import com.parcelpickup.entity.ExpressPoint;
import com.parcelpickup.service.ExpressPointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/express-points")
@CrossOrigin(origins = "*")
public class ExpressPointController {
    
    @Autowired
    private ExpressPointService expressPointService;
    
    @GetMapping("/active")
    public Result<List<ExpressPoint>> getActiveExpressPoints() {
        List<ExpressPoint> points = expressPointService.findAllActive();
        return Result.success(points);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<PageResult<ExpressPoint>> getAllExpressPoints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ExpressPoint> points = expressPointService.findAll(page, size);
        return Result.success(PageResult.of(points));
    }
    
    @GetMapping("/{id}")
    public Result<ExpressPoint> getExpressPointById(@PathVariable Long id) {
        Optional<ExpressPoint> point = expressPointService.findById(id);
        return point.map(Result::success)
                .orElse(Result.error("快递点不存在"));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<ExpressPoint> createExpressPoint(@RequestBody ExpressPoint expressPoint) {
        return expressPointService.createExpressPoint(expressPoint);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<ExpressPoint> updateExpressPoint(@PathVariable Long id, @RequestBody ExpressPoint expressPoint) {
        return expressPointService.updateExpressPoint(id, expressPoint);
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        return expressPointService.updateStatus(id, status);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> deleteExpressPoint(@PathVariable Long id) {
        return expressPointService.deleteExpressPoint(id);
    }
}
