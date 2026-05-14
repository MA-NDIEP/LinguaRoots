package com.example.lessonmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordDto {

    private Integer wordId;

    private String word;
    private String translation;
    private String example;
    private String exampleTranslation;

    private MultipartFile audioUrl;

}
