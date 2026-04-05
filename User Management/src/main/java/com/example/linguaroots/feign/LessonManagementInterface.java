package com.example.linguaroots.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value="Lesson-Management")
public interface LessonManagementInterface {

    @PostMapping("/lesson/init")
    public ResponseEntity<?> initializeProgress(@RequestParam Integer studentId);
}
