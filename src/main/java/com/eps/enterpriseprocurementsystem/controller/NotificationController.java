package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.NotificationDTO;
import com.eps.enterpriseprocurementsystem.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get Notifications By User
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public List<NotificationDTO> getNotificationsByUser(
            @PathVariable Long userId) {

        return notificationService.getNotificationsByUser(userId);
    }

    // Mark Notification As Read
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public NotificationDTO markAsRead(
            @PathVariable Long id) {

        return notificationService.markAsRead(id);
    }
}