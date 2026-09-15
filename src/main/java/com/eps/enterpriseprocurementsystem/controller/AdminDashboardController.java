package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.AdminDashboardStatsDTO;
import com.eps.enterpriseprocurementsystem.service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;


    // ==========================================
    // GET ADMIN DASHBOARD STATISTICS
    // ==========================================

    @GetMapping("/stats")
    public AdminDashboardStatsDTO getDashboardStats() {

        System.out.println(
                "ADMIN DASHBOARD STATS REQUEST RECEIVED"
        );

        return adminDashboardService.getDashboardStats();
    }

}