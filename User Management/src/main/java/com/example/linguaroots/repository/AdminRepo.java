package com.example.linguaroots.repository;

import com.example.linguaroots.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepo extends JpaRepository<Admin,Integer> {
    Admin findByUsername(String username);
    Admin findByEmail(String email);
}
