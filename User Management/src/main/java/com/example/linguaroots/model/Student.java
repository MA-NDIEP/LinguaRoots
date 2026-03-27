package com.example.linguaroots.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Student extends User implements Serializable {

    private String username;
    private Boolean isActive = true;
}
