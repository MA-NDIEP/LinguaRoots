package com.example.postmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostLikeRequest {
    private Integer postId;
    private String anonymousId;
    private Integer userId;
}
