package com.example.lessonmanagement.repository;

import com.example.lessonmanagement.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepo extends JpaRepository<Lesson, Integer> {
}
