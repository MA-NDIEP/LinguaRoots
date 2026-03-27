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
        Admin existingAdmin = adminRepo.findById(adminId).get();
        existingAdmin.setUsername(admin.getUsername());
        existingAdmin.setEmail(admin.getEmail());
        existingAdmin.setPassword(admin.getPassword());
        existingAdmin.setTelephone(admin.getTelephone());
        return adminRepo.save(existingAdmin);
    }

    public Admin deactiveAdmin(Integer adminId) {
        Admin existingAdmin = adminRepo.findById(adminId).get();
        existingAdmin.setIsActive(false);
        return adminRepo.save(existingAdmin);
    }
}
