package com.example.lessonmanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer lessonId;

    @Enumerated(EnumType.STRING)
    private Type type;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    //audio file
    private String  pronunciation;
    private String writtenPronunciation;

    @Column(columnDefinition = "TEXT")
    private String englishEquivalent;
    private String example;
    private Status status;

    private Integer lessonOrder;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

}
