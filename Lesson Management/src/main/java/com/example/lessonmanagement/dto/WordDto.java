package com.example.lessonmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordDto {

    private String word;
    private String translation;
    private String example;
    private String exampleTranslation;

}
