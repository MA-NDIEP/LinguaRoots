package com.example.lessonmanagement.service;

import com.example.lessonmanagement.model.StudentLessonProgress;
import com.example.lessonmanagement.repository.StudentLessonProgressRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class StudentLessonProgressService {

    @Autowired
    private StudentLessonProgressRepo studentLessonProgressRepo;

    public StudentLessonProgress getProgress(Integer studentId) {
        return studentLessonProgressRepo.findByStudentId(studentId);
    }

    public StudentLessonProgress initProgress(Integer studentId) {
        StudentLessonProgress progress = new StudentLessonProgress();
        progress.setStudentId(studentId);
        progress.setCurrentLessonOrder(1); // start at the beginning

        return studentLessonProgressRepo.save(progress);
    }

    public void completeLesson(Integer studentId,Integer lessonOrder) {
        StudentLessonProgress progress = studentLessonProgressRepo.findByStudentId(studentId);
        if (!Objects.equals(progress.getCurrentLessonOrder(), lessonOrder)) {
            throw new RuntimeException("You must complete the previous lesson before moving on to the next one.");
        }
        progress.setCurrentLessonOrder(lessonOrder + 1); // move to the next lesson
        studentLessonProgressRepo.save(progress);
    }
}
