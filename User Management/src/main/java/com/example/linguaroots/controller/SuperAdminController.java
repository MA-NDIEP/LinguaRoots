package com.example.linguaroots.controller;

import com.example.linguaroots.config.PasswordConfig;
import com.example.linguaroots.dto.NewAdminDto;
import com.example.linguaroots.model.Admin;
import com.example.linguaroots.model.Role;
import com.example.linguaroots.service.AdminService;
import com.example.linguaroots.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class SuperAdminController {
    @Autowired
    private AdminService adminService;

    @Autowired
    private PasswordConfig passwordEncoder;

    @Autowired
    private UserService userService;

    @GetMapping("/panel")
    public String superAdmin() {
        return "Welcome Super Admin";
    }

    @GetMapping("/all")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        try{
            List<Admin> admins = adminService.getAllAdmins();

            if(admins.isEmpty()){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(admins, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Admin> createAdmin(@RequestBody NewAdminDto newAdmin) {
        try{
            Admin admin = new Admin();
            admin.setUsername(newAdmin.getUsername());
            admin.setEmail(newAdmin.getEmail());
            admin.setPassword(passwordEncoder.passwordEncoder().encode(newAdmin.getPassword()));
            admin.setTelephone(newAdmin.getTelephone());
            admin.setIsActive(true);
            admin.setRole(Role.ROLE_ADMIN);

            return new ResponseEntity<>(adminService.createAdmin(admin), HttpStatus.CREATED);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Admin> updateAdmin(@RequestBody Admin admin) {
        try{
            Admin existingAdmin = adminService.getAdminById(admin.getId());
            if(existingAdmin == null){
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(adminService.updateAdmin(existingAdmin.getId(), admin), HttpStatus.OK);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PutMapping("/deactivate")
    public ResponseEntity<Admin> deactivateAdmin(@RequestParam Integer adminId) {
        try{
            Admin admin = adminService.getAdminById(adminId);

            if(admin == null){
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(adminService.deactiveAdmin(adminId), HttpStatus.OK);

        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
