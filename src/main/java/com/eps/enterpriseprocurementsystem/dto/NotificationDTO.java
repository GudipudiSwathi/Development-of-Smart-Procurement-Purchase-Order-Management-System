package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

@Data
public class NotificationDTO {

    private Long notificationId;

    private Long userId;

    private String message;

    private Boolean isRead;
}