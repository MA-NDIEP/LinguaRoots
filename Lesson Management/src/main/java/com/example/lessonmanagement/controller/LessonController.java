package com.example.lessonmanagement.controller;

import com.example.lessonmanagement.dto.LessonDto;
import com.example.lessonmanagement.model.Lesson;
import com.example.lessonmanagement.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lesson")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @GetMapping("/all")
    public ResponseEntity<List<Lesson>> getAllLessons() {
        try{
            List<Lesson> lessons = lessonService.getAllLessons();
            if(lessons.isEmpty()){
                return ResponseEntity.noContent().build();
            }
            return new ResponseEntity<>(lessons, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Lesson> createLesson(@RequestBody LessonDto lessonDto) {
        try{
            Lesson newLesson = lessonService.addLesson(lessonDto);
            if (newLesson == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(newLesson, HttpStatus.CREATED);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Lesson> updateLesson(@RequestBody Lesson lesson) {
        try{
            Lesson updatedLesson = lessonService.updateLesson(lesson);
            if (updatedLesson == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(updatedLesson, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }

    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteLessonById(Integer lessonId) {
        try{
            lessonService.deleteLesson(lessonId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
