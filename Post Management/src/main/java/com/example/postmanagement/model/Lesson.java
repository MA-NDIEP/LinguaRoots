package com.example.postmanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    private Integer lessonId;

    private LessonType type;

    private String title;
    private String content;

    //audio file
    private String  pronunciation;
    private String writtenPronunciation;
    private String englishEquivalent;
    private String example;
    private LessonStatus status;

    private Integer lessonOrder;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
