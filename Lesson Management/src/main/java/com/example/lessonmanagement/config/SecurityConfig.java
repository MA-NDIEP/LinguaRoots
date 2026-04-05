package com.example.lessonmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/lesson/all").hasAnyAuthority("ROLE_STUDENT", "ROLE_SUPER_ADMIN", "ROLE_ADMIN")
                                .requestMatchers("/lesson/student").hasRole("STUDENT")
                                .requestMatchers("/lesson/complete").hasRole("STUDENT")
                        .requestMatchers("/lesson/add").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")
                                .requestMatchers("/lesson/update").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")
                                .requestMatchers("/lesson/delete").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")

//                                .requestMatchers("/lesson/**").permitAll()
                        .anyRequest().permitAll()
                )
                .addFilterAt(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
