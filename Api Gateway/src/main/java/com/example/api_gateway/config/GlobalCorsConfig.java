package com.example.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration; // Note: No .reactive here
import org.springframework.web.cors.reactive.CorsWebFilter; // These MUST have .reactive
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class GlobalCorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // When using allowCredentials(true), you MUST be specific with Origins.
        // "*" is often rejected by browsers when credentials are included.
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of("https://linguaroots.onrender.com", "http://localhost:4200"));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));

        // Ensure the preflight response stays valid for a while
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}
