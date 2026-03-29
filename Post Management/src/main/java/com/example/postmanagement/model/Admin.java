package com.example.postmanagement.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

    private Integer adminId;
    private String name;
    private String email;
    private String password;
    private Integer telephone;

    private Boolean isActive;

}
