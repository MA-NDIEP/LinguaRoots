package com.example.postmanagement.feign;

import com.example.postmanagement.model.Lesson;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(value="Lesson-Management")
public interface LessonManagementInterface {

    @GetMapping("/lesson/all")
    public ResponseEntity<List<Lesson>> getAllLessons();
}
