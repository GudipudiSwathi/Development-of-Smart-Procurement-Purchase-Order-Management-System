package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentProcessDTO {

    /*
     * Required for QR_CODE and UPI payments.
     */
    private String mpin;


    /*
     * Used only for CREDIT_CARD.
     */
    private String cardHolderName;

    private String cardNumber;

    private String cardExpiry;

    private String cardCvv;


    /*
     * Optional transaction reference entered/generated
     * by the payment flow.
     */
    private String transactionReference;
}