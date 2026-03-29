package com.example.lessonmanagement.dto;

import com.example.lessonmanagement.model.Type;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class LessonDto {
    private Type lessonType;

    private String title;
    private String content;

    //audio file
    private String pronunciation;
    private String writtenPronunciation;
    private String englishEquivalent;
    private String example;


}
