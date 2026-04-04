package com.example.lessonmanagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
        System.out.println("JwtAuthFilter initialized!");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("JwtAuthFilter hit: " + request.getRequestURI());

        String header = request.getHeader("Authorization");
//        String gatewayHeader = request.getHeader("X-Gateway");


        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        System.out.println("Lesson filter hit");

        System.out.println(jwtUtil.validateToken(token));

        try {
            if (!jwtUtil.validateToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                System.out.println("Blocking request 1");
                return;
            }
        } catch (Exception e) {
            e.printStackTrace(); // 🔥 VERY IMPORTANT
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            System.out.println("Blocking request 2");
            return;
        }

        String role = jwtUtil.extractRole(token); // e.g., "ROLE_STUDENT"
        Long userId = jwtUtil.extractUserId(token);

        List<GrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority(role));

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        userId,   // 🔥 store ID
                        null,
                        authorities
                );

        System.out.println("Authorization Header: " + header);
        System.out.println("Setting authentication: " + userId + ", roles: " + authorities);
//        System.out.println("Gateway Header: " + gatewayHeader);

        SecurityContextHolder.getContext().setAuthentication(auth);

        System.out.println("Passing request forward");

        filterChain.doFilter(request, response);

//        if (gatewayHeader == null) {
//            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//            return;
//        }
    }
}