package com.example.linguaroots.controller;

import com.example.linguaroots.config.JwtUtil;
import com.example.linguaroots.dto.AdminRegisterRequest;
import com.example.linguaroots.dto.AuthRequest;
import com.example.linguaroots.dto.StudentRegisterRequest;
import com.example.linguaroots.dto.SuperAdminRegisterRequest;
import com.example.linguaroots.model.RegisterRequest;
import com.example.linguaroots.model.User;
import com.example.linguaroots.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @PostMapping("/register/student")
    public String registerStudent(@RequestBody StudentRegisterRequest request) {
        userService.registerStudent(request);
        return "Student registered";
    }

    @PostMapping("/register/admin")
    public String registerAdmin(@RequestBody AdminRegisterRequest request) {
        userService.registerAdmin(request);
        return "Admin registered";
    }

    @PostMapping("/register/superadmin")
    public String registerSuperAdmin(@RequestBody SuperAdminRegisterRequest request) {
        userService.registerSuperAdmin(request);
        return "Super Admin registered";
    }

    @PostMapping("/login")
    public String login (@RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
//        UserDetails user = (UserDetails) authentication.getPrincipal();
        User user = userService.findUserByEmail(request.getEmail());

        assert user != null;
        return jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
