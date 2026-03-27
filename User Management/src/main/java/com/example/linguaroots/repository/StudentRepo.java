package com.example.linguaroots.repository;

import com.example.linguaroots.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.io.Serializable;

public interface StudentRepo extends JpaRepository<Student,Integer> {
    Student findByUsername(String username);
    Student findByEmail(String email);
}
