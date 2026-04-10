package com.example.postmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentReply {
    private Integer commentId;
    private String username;
    private String content;
    private Boolean isLiked;
    private LocalDateTime datePublished;
    private Boolean isDeleted;

    List<CommentDto> replies;
}
