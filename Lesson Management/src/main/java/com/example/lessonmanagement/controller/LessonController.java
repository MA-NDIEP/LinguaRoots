package com.example.lessonmanagement.controller;

import com.example.lessonmanagement.dto.LessonDto;
import com.example.lessonmanagement.dto.UpdateLessonDto;
import com.example.lessonmanagement.model.Lesson;
import com.example.lessonmanagement.service.LessonService;
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
}
