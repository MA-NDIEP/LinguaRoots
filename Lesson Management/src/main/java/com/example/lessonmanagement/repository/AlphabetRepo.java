package com.example.lessonmanagement.repository;

import com.example.lessonmanagement.model.Alphabet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlphabetRepo extends JpaRepository<Alphabet, Integer> {
}
