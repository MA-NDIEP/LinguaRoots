package com.example.postmanagement.dto;

import com.example.postmanagement.model.Type;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostComment {

    private Integer postId;
    private String image;
    private String video;
    private String title;
    private String content;
    private String translation;
    private Type type;

    private List<CommentDto> comments;
}
