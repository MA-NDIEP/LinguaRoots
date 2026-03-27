package com.example.lessonmanagement.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    private Integer studentId;
    private String name;
    private String email;
    private String password;
    private Integer telephone;
    private Boolean isActive;

}
