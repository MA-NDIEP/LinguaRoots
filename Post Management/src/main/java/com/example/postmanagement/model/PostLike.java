package com.example.postmanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class PostLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Setter
    @ManyToOne
    @JoinColumn(name = "post_id", nullable = true)  // ADD nullable = true
    private Post post;

    private Integer userId;

    @Column(name = "anonymous_id")
    private String anonymousId;

    private LocalDateTime likedAt;

}