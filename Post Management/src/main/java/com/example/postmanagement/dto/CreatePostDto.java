package com.example.postmanagement.dto;

import com.example.postmanagement.model.Type;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class CreatePostDto {

    private MultipartFile image;
    private MultipartFile video;

    private String title;

    private String content;
    private String translation;
    private Type type;

}

