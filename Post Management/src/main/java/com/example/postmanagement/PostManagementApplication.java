package com.example.postmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class PostManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(PostManagementApplication.class, args);
    }

}
