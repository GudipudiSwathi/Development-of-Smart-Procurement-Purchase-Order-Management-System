package com.eps.enterpriseprocurementsystem.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "purchase_request_items")
public class PurchaseRequestItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long purchaseRequestItemId;


    // =====================================================
    // PURCHASE REQUEST
    // =====================================================

    @ManyToOne
    @JoinColumn(
            name = "purchase_request_id",
            nullable = false
    )
    private PurchaseRequest purchaseRequest;


    // =====================================================
    // PRODUCT
    // =====================================================

    @ManyToOne
    @JoinColumn(
            name = "product_id",
            nullable = false
    )
    private Product product;


    // =====================================================
    // SUPPLIER
    // Supplier is selected according to the product's
    // category.
    // =====================================================

    @ManyToOne
    @JoinColumn(
            name = "supplier_id"
    )
    private Supplier supplier;


    // =====================================================
    // QUANTITY
    // =====================================================

    @Column(nullable = false)
    private Integer quantity;


    // =====================================================
    // ITEM TOTAL PRICE
    // =====================================================

    @Column(nullable = false)
    private Double itemTotalPrice;


    // =====================================================
    // GETTERS & SETTERS
    // =====================================================

    public Long getPurchaseRequestItemId() {
        return purchaseRequestItemId;
    }

    public void setPurchaseRequestItemId(
            Long purchaseRequestItemId) {

        this.purchaseRequestItemId =
                purchaseRequestItemId;
    }


    public PurchaseRequest getPurchaseRequest() {
        return purchaseRequest;
    }

    public void setPurchaseRequest(
            PurchaseRequest purchaseRequest) {

        this.purchaseRequest =
                purchaseRequest;
    }


    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }


    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }


    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }


    public Double getItemTotalPrice() {
        return itemTotalPrice;
    }

    public void setItemTotalPrice(
            Double itemTotalPrice) {

        this.itemTotalPrice =
                itemTotalPrice;
    }
}