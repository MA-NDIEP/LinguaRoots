package com.example.linguaroots.repository;

import com.example.linguaroots.model.SuperAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuperAdminRepo extends JpaRepository<SuperAdmin,Integer> {
}
