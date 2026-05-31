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
public class AlphabetDto {

    private Integer id;

    private String character;
    private MultipartFile nativePronunciation;
    private String englishEquivalent;
    private String nativeExample;
    private String englishExample;

    private Boolean audioDeleted;
    private String deletedAudioUrl;

}
