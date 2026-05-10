package com.example.postmanagement.dto;

import com.example.postmanagement.model.Type;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class CreatePostDto {

    private MultipartFile image;
    private MultipartFile video;
    private MultipartFile audio;
    private List<MultipartFile> galleryImageFiles;

    private String title;

    private String content;
    private String translation;
    private Type type;

    private String riddleAnswer;

}

