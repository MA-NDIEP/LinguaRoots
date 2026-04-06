package com.example.linguaroots.service;

import com.example.linguaroots.model.Admin;
import com.example.linguaroots.repository.AdminRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private AdminRepo adminRepo;

    public List<Admin> getAllAdmins() {
        return adminRepo.findAll();
    }

    public Admin getAdminById(Integer adminId) {
        return adminRepo.findById(adminId).get();
    }

    public Admin getAdminByUsername(String username) {
        return adminRepo.findByUsername(username);
    }

    public Admin getAdminByEmail(String email) {
        return adminRepo.findByEmail(email);
    }

    public Admin createAdmin(Admin admin) {
        return adminRepo.save(admin);
    }

    public Admin updateAdmin(Integer adminId, Admin admin) {
        Admin existingAdmin = adminRepo.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + adminId));

        if (admin.getUsername() != null) {
            existingAdmin.setUsername(admin.getUsername());
        }
        if (admin.getEmail() != null) {
            existingAdmin.setEmail(admin.getEmail());
        }
        if (admin.getPassword() != null) {
            existingAdmin.setPassword(admin.getPassword());
        }
        if (admin.getTelephone() != null) {
            existingAdmin.setTelephone(admin.getTelephone());
        }
        return adminRepo.save(existingAdmin);
    }

    public Admin deactiveAdmin(Integer adminId) {
        Admin existingAdmin = adminRepo.findById(adminId).get();
        existingAdmin.setIsActive(!existingAdmin.getIsActive());
        return adminRepo.save(existingAdmin);
    }
}
