package com.example.linguaroots.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuperAdminRegisterRequest {

    private String username;
    private String password;
    private String email;
}
