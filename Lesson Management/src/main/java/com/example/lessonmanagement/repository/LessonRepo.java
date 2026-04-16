package com.example.lessonmanagement.repository;

import com.example.lessonmanagement.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepo extends JpaRepository<Lesson, Integer> {
    List<Lesson> findAllByOrderByLessonOrderAsc();
}
