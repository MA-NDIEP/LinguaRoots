package com.example.lessonmanagement.controller;

import com.example.lessonmanagement.dto.LessonDto;
import com.example.lessonmanagement.dto.LessonWIthProgressDto;
import com.example.lessonmanagement.dto.UpdateLessonDto;
import com.example.lessonmanagement.model.Lesson;
import com.example.lessonmanagement.model.Progress;
import com.example.lessonmanagement.model.StudentLessonProgress;
import com.example.lessonmanagement.service.LessonService;
import com.example.lessonmanagement.service.StudentLessonProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/lesson")
public class LessonController {

    private static final String UPLOAD_DIR = "uploads";

    String baseUrl = "http://localhost:8765/lesson/media";

    @Autowired
    private LessonService lessonService;

    @Autowired
    private StudentLessonProgressService studentLessonProgressService;

    @GetMapping("/me")
    public String currentUser(Authentication authentication) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Auth: " + auth);
        return "Logged in as: ";
    }


    @GetMapping("/all")
    public ResponseEntity<List<Lesson>> getAllLessons() {
        try{
            List<Lesson> lessons = lessonService.getAllLessons();
            for (Lesson lesson : lessons) {
                lesson.setPronunciation(baseUrl + "/" + lesson.getPronunciation());
            }
            if(lessons.isEmpty()){
                return ResponseEntity.noContent().build();
            }
            return new ResponseEntity<>(lessons, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @GetMapping("/student")
    public ResponseEntity<List<LessonWIthProgressDto>> getAllStudentLesson(@RequestParam Integer studentId) {
        try{
            List<Lesson> lessons = lessonService.getAllLessons();
            System.out.println("Lessons: " + lessons);
            StudentLessonProgress progress = studentLessonProgressService.getProgress(studentId);
            if (progress == null) {
                progress = studentLessonProgressService.initProgress(studentId);
            }
            System.out.println("Progress: " + progress);

            List<LessonWIthProgressDto> lessonWithProgress = lessons.stream().map(lesson -> {
                LessonWIthProgressDto dto = new LessonWIthProgressDto();
                dto.setLessonId(lesson.getLessonId());
                dto.setType(lesson.getType());
                dto.setTitle(lesson.getTitle());
                dto.setContent(lesson.getContent());
                dto.setPronunciation(baseUrl + "/" + lesson.getPronunciation());
                dto.setWrittenPronunciation(lesson.getWrittenPronunciation());
                dto.setEnglishEquivalent(lesson.getEnglishEquivalent());
                dto.setExample(lesson.getExample());
                dto.setStatus(lesson.getStatus());
                dto.setLessonOrder(lesson.getLessonOrder());
                if (lesson.getLessonOrder() < progress.getCurrentLessonOrder()) {
                    dto.setProgress(Progress.COMPLETED);
                }
                else if (lesson.getLessonOrder().equals(progress.getCurrentLessonOrder())) {
                    dto.setProgress(Progress.OPEN);
                }
                else {
                    dto.setProgress(Progress.LOCKED);
                }
                dto.setCurrentLessonOrder(progress.getCurrentLessonOrder());
                return dto;
            }).toList();

            System.out.println("Lessons with progress" + lessonWithProgress);

            if(lessonWithProgress.isEmpty()){
                return ResponseEntity.noContent().build();
            }
            return new ResponseEntity<>(lessonWithProgress, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @GetMapping("/media/{filename}")
    public ResponseEntity<Resource> getMedia(@PathVariable String filename) {
        try {
            Path path = Paths.get(UPLOAD_DIR).resolve(filename);
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(path);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Lesson> createLesson(@ModelAttribute LessonDto lessonDto) {
        try{
            Lesson newLesson = lessonService.addLesson(lessonDto);
            if (newLesson == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(newLesson, HttpStatus.CREATED);
        }catch (Exception e){
            System.out.println("Exception: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Lesson> updateLesson(@ModelAttribute UpdateLessonDto updateLesson) {
        try{
            Lesson updatedLesson = lessonService.updateLesson(updateLesson);
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
            lessonService.isPublished(lessonId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PostMapping("/complete")
    public ResponseEntity<?> completeLesson(@RequestParam Integer studentId, @RequestParam Integer lessonOrder) {
        try{
            studentLessonProgressService.completeLesson(studentId,lessonOrder);
            return new ResponseEntity<>(HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }

    }

    @PostMapping("/init")
    public ResponseEntity<?> initializeProgress(@RequestParam Integer studentId) {
        try{
            StudentLessonProgress progress = studentLessonProgressService.initProgress(studentId);
            if (progress == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(progress, HttpStatus.CREATED);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
