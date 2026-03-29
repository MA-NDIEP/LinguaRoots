package com.example.postmanagement.dto;

import com.example.postmanagement.model.Type;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class PostDto {

    private String image;
    private String video;

    private String title;

    private String content;
    private String translation;
    private Type type;

}

