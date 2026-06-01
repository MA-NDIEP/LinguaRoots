package com.example.linguaroots.service;

import com.example.linguaroots.model.Role;
import com.example.linguaroots.model.SuperAdmin;
import com.example.linguaroots.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(1)
public class SuperAdminSeeder implements CommandLineRunner {

    @Autowired
    private UserRepo userRepo;

    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        String email = "admin1@gmail.com";

        if (!userRepo.existsByEmail(email)) {

            SuperAdmin superAdmin = new SuperAdmin();

            superAdmin.setEmail(email);
            superAdmin.setPassword(
                    passwordEncoder.encode("admin1")
            );
            superAdmin.setRole(Role.ROLE_SUPER_ADMIN);

            superAdmin.setUsername("superadmin");

            userRepo.save(superAdmin);

            System.out.println("Super Admin created successfully");
        }
    }
}