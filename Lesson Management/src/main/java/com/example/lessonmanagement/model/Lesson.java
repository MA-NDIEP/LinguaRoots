package com.example.lessonmanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String content;

    //audio file
    private String  pronunciation;
    private String writtenPronunciation;
    private String englishEquivalent;
    private String example;
    private Status status;

    private Integer order;

}
