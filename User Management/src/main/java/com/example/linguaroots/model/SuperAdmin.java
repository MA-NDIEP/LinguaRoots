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
public class SuperAdmin extends User implements Serializable {

    private String username;

    @Override
    public String getUsername() {
        return this.username;
    }

}
