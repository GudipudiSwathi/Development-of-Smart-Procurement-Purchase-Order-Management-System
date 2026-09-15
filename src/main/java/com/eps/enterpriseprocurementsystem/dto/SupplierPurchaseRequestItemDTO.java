package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;


@Data
public class SupplierPurchaseRequestItemDTO {

    private Long productId;

    private String productName;

    private Integer quantity;

    private Double itemTotalPrice;

}