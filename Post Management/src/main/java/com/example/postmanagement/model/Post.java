package com.example.postmanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer postId;

    private String image;

    @ElementCollection
    @CollectionTable(name = "post_gallery_images", joinColumns = @JoinColumn(name = "post_id"))
    private List<String> galleryImageFiles;

    private String video;
    private String audio;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String riddleAnswer;

    @Column(columnDefinition = "TEXT")
    private String translation;
    private Type type;

    private Boolean isPublished;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
