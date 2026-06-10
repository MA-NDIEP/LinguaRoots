package com.example.linguaroots.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDto {

    private Integer id;
    private String username;
    private Integer telephone;
    private String email;
    private String password;
    private String confirmPassword;

    private Boolean isActive = true;
}
