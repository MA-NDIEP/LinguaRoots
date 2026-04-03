package com.example.postmanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer commentId;

    private String username;
    private String content;
    private Boolean isLiked;
    private LocalDateTime datePublished;
    private Boolean isDeleted;
    private LocalDateTime dateDeleted;

    @ManyToOne(fetch = FetchType.EAGER)
    private Post post;
}
