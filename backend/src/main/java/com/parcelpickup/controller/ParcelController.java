package com.parcelpickup.controller;

import com.parcelpickup.common.PageResult;
import com.parcelpickup.common.Result;
import com.parcelpickup.dto.ParcelDTO;
import com.parcelpickup.entity.Parcel;
import com.parcelpickup.entity.ParcelLog;
import com.parcelpickup.service.ParcelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/parcels")
@CrossOrigin(origins = "*")
public class ParcelController {
    
    @Autowired
    private ParcelService parcelService;
    
    @PostMapping
    public Result<Parcel> createParcel(@Valid @RequestBody ParcelDTO parcelDTO) {
        return parcelService.createParcel(parcelDTO);
    }
    
    @GetMapping("/available")
    public Result<PageResult<Parcel>> getAvailableParcels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Parcel> parcels = parcelService.findAvailableParcels(page, size);
        return Result.success(PageResult.of(parcels));
    }
    
    @GetMapping("/my-published")
    public Result<PageResult<Parcel>> getMyPublishedParcels(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Parcel> parcels = parcelService.findMyPublishedParcels(status, page, size);
        return Result.success(PageResult.of(parcels));
    }
    
    @GetMapping("/my-accepted")
    public Result<PageResult<Parcel>> getMyAcceptedParcels(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Parcel> parcels = parcelService.findMyAcceptedParcels(status, page, size);
        return Result.success(PageResult.of(parcels));
    }
    
    @GetMapping("/{id}")
    public Result<Parcel> getParcelById(@PathVariable Long id) {
        Optional<Parcel> parcel = parcelService.findById(id);
        return parcel.map(Result::success)
                .orElse(Result.error("订单不存在"));
    }
    
    @PostMapping("/{id}/accept")
    public Result<Parcel> acceptParcel(@PathVariable Long id) {
        return parcelService.acceptParcel(id);
    }
    
    @PostMapping("/{id}/start-delivery")
    public Result<Parcel> startDelivery(@PathVariable Long id) {
        return parcelService.startDelivery(id);
    }
    
    @PostMapping("/{id}/complete")
    public Result<Parcel> completeParcel(@PathVariable Long id) {
        return parcelService.completeParcel(id);
    }
    
    @PostMapping("/{id}/cancel")
    public Result<Parcel> cancelParcel(@PathVariable Long id, @RequestBody(required = false) String reason) {
        if (reason == null) reason = "用户取消";
        return parcelService.cancelParcel(id, reason);
    }
    
    @GetMapping("/{id}/logs")
    public Result<List<ParcelLog>> getParcelLogs(@PathVariable Long id) {
        List<ParcelLog> logs = parcelService.getParcelLogs(id);
        return Result.success(logs);
    }
}
