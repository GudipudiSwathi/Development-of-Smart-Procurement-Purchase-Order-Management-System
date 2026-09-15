package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.NotificationDTO;
import com.eps.enterpriseprocurementsystem.entity.Notification;
import com.eps.enterpriseprocurementsystem.entity.User;
import com.eps.enterpriseprocurementsystem.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    // Create Notification
    public NotificationDTO saveNotification(Long userId, String message) {

        User user = userService.getUserEntityById(userId);

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedDate(LocalDateTime.now());

        Notification savedNotification =
                notificationRepository.save(notification);

        return convertToDTO(savedNotification);
    }

    // Get Notifications By User
    public List<NotificationDTO> getNotificationsByUser(Long userId) {

        return notificationRepository.findByUserUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // Mark Notification As Read
    public NotificationDTO markAsRead(Long id) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));

        notification.setIsRead(true);

        Notification updatedNotification =
                notificationRepository.save(notification);

        return convertToDTO(updatedNotification);
    }

    // Entity -> DTO
    private NotificationDTO convertToDTO(Notification notification) {

        NotificationDTO dto = new NotificationDTO();

        dto.setNotificationId(notification.getNotificationId());
        dto.setUserId(notification.getUser().getUserId());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead());

        return dto;
    }
}