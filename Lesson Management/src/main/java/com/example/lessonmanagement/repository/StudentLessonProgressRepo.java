package com.example.lessonmanagement.repository;

import com.example.lessonmanagement.model.StudentLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentLessonProgressRepo extends JpaRepository<StudentLessonProgress, Integer> {
    StudentLessonProgress findByStudentId(Integer studentId);
}
