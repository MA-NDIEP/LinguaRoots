package com.example.lessonmanagement.dto;

import com.example.lessonmanagement.model.Progress;
import com.example.lessonmanagement.model.Status;
import com.example.lessonmanagement.model.Type;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonWIthProgressDto {
    private Integer lessonId;
    private Type type;

    private String title;
    private String content;

    //audio file
    private String pronunciation;
    private String writtenPronunciation;
    private String englishEquivalent;
    private String example;
    private Status status;
    private Progress progress;
    private Integer currentLessonOrder;
    private Integer lessonOrder;

}
