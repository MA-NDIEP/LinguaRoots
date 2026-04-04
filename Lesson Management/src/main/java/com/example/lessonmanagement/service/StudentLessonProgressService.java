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

    public StudentLessonProgress initProgress(Integer studentId, Integer lessonId) {
        StudentLessonProgress progress = new StudentLessonProgress();
        progress.setStudentId(studentId);
        progress.setLessonId(lessonId);
        progress.setCurrentLessonOrder(1); // start at the beginning

        return studentLessonProgressRepo.save(progress);
    }

    public StudentLessonProgress updateProgress(Integer studentId, Integer lessonId, Integer newOrder) {
        StudentLessonProgress progress = studentLessonProgressRepo.findByStudentIdAndLessonId(studentId, lessonId);
        if (progress != null) {
            progress.setCurrentLessonOrder(newOrder);
            return studentLessonProgressRepo.save(progress);
        }
        return null; // or throw an exception
    }

    public void completeLesson(Integer studentId, Integer lessonId, Integer lessonOrder) {
        StudentLessonProgress progress = studentLessonProgressRepo.findByStudentIdAndLessonId(studentId, lessonId);
        if (!Objects.equals(progress.getCurrentLessonOrder(), lessonOrder)) {
            throw new RuntimeException("You must complete the previous lesson before moving on to the next one.");
        }
        progress.setCurrentLessonOrder(lessonOrder + 1); // move to the next lesson
        studentLessonProgressRepo.save(progress);
    }
}
