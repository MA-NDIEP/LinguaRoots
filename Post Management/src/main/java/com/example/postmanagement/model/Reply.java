package com.example.postmanagement.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    //Comment to which the reply is for
    private Integer commentId;

    private String username;
    private String content;
    private Boolean isLiked;
    private LocalDateTime datePublished;
    private Boolean isDeleted;
    private LocalDateTime dateDeleted;

}
