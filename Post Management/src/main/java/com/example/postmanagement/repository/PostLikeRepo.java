package com.example.postmanagement.repository;

import com.example.postmanagement.model.Post;
import com.example.postmanagement.model.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepo extends JpaRepository<PostLike,Integer> {
    boolean existsByPost_PostIdAndUserId(Integer postId,Integer userId);
    boolean existsByPost_PostIdAndAnonymousId(Integer postId,String anonymousId);
    Integer countByPost(Post post);
    Optional<PostLike> findByPost_PostIdAndUserId(Integer postId, Integer userId);
    Optional<PostLike> findByPost_PostIdAndAnonymousId(Integer postId, String anonymousId);
}
