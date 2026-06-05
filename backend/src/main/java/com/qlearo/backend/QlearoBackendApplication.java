package com.qlearo.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class QlearoBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(QlearoBackendApplication.class, args);
    }
}
