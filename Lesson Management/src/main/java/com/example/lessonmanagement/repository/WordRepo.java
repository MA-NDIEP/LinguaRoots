package com.example.lessonmanagement.repository;

import com.example.lessonmanagement.model.Word;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WordRepo extends JpaRepository<Word, Integer> {
}
