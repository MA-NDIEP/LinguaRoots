package com.example.postmanagement.dto;

import com.example.postmanagement.model.Type;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDto {

    private Integer postId;
    private MultipartFile image;
    private MultipartFile video;
    private MultipartFile audio;

    private String title;

    private String content;
    private String translation;
    private Type type;
}
