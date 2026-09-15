package com.eps.enterpriseprocurementsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EnterpriseProcurementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                EnterpriseProcurementSystemApplication.class,
                args
        );
    }
}