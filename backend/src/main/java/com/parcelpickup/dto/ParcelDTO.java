package com.parcelpickup.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class ParcelDTO {
    
    @NotNull(message = "快递点不能为空")
    private Long expressPointId;
    
    @NotBlank(message = "取件码不能为空")
    private String pickupCode;
    
    @NotBlank(message = "送达地点不能为空")
    private String deliveryAddress;
    
    @NotBlank(message = "联系人不能为空")
    private String contactPerson;
    
    @NotBlank(message = "联系电话不能为空")
    private String contactPhone;
    
    @NotNull(message = "酬劳不能为空")
    private BigDecimal reward;
    
    private String parcelType;
    private BigDecimal weight;
    private String remark;
}
