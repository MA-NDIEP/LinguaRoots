package com.example.linguaroots.service;

import com.example.linguaroots.dto.AdminRegisterRequest;
import com.example.linguaroots.dto.StudentRegisterRequest;
import com.example.linguaroots.dto.SuperAdminRegisterRequest;
import com.example.linguaroots.feign.LessonManagementInterface;
import com.example.linguaroots.model.*;
import com.example.linguaroots.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LessonManagementInterface lessonManagementInterface;

    public void registerStudent(StudentRegisterRequest request) {

        Student student = new Student();

        student.setUsername(request.getUsername());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setEmail(request.getEmail());
        student.setRole(Role.ROLE_STUDENT);


        userRepository.save(student);

        lessonManagementInterface.initializeProgress(student.getId());
    }

    public void registerAdmin(AdminRegisterRequest request) {

        Admin admin = new Admin();

        admin.setUsername(request.getUsername());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setEmail(request.getEmail());
        admin.setTelephone(request.getTelephone());
        admin.setRole(Role.ROLE_ADMIN);
        admin.setIsActive(true);

        userRepository.save(admin);
    }

    public void registerSuperAdmin(SuperAdminRegisterRequest request) {

        SuperAdmin superAdmin = new SuperAdmin();

        superAdmin.setUsername(request.getUsername());
        superAdmin.setPassword(passwordEncoder.encode(request.getPassword()));
        superAdmin.setEmail(request.getEmail());
        superAdmin.setRole(Role.ROLE_SUPER_ADMIN);

        userRepository.save(superAdmin);
    }

    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
