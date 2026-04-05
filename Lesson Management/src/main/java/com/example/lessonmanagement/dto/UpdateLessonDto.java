package com.example.lessonmanagement.dto;

import com.example.lessonmanagement.model.Status;
import com.example.lessonmanagement.model.Type;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateLessonDto {

    private Integer lessonId;
    private Type type;

    private String title;
    private String content;

    //audio file
    private MultipartFile pronunciation;
    private String writtenPronunciation;
    private String englishEquivalent;
    private String example;
    private Status status;
    private Integer lessonOrder;

}
