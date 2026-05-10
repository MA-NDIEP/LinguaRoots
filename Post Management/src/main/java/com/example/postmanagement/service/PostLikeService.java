package com.example.postmanagement.service;

import com.example.postmanagement.model.Post;
import com.example.postmanagement.model.PostLike;
import com.example.postmanagement.repository.PostLikeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PostLikeService {

    @Autowired
    private PostService postService;

    @Autowired
    private PostLikeRepo postLikeRepo;

    public void likePost(Integer postId, Integer userId, String anonymousId) {

        Post post = postService.findPostById(postId);
        boolean alreadyLiked;

        if (userId != null) {
            alreadyLiked =
                    postLikeRepo.existsByPost_PostIdAndUserId(postId, userId);
        } else {
            alreadyLiked =
                    postLikeRepo.existsByPost_PostIdAndAnonymousId(postId, anonymousId);
        }

        if (alreadyLiked) {
            return;
        }

        PostLike like = new PostLike();

        like.setPost(post);
        like.setUserId(userId);
        like.setAnonymousId(anonymousId);
        like.setLikedAt(LocalDateTime.now());

        postLikeRepo.save(like);
    }

    public void unlikePost(Integer postId, Integer userId, String anonymousId) {

        Post post = postService.findPostById(postId);

        Optional<PostLike> like;

        if (userId != null) {
            like = postLikeRepo.findByPost_PostIdAndUserId(postId, userId);
        } else {
            like = postLikeRepo.findByPost_PostIdAndAnonymousId(postId, anonymousId);
        }

        like.ifPresent(postLikeRepo::delete);
    }

    public long getLikes(Integer postId) {

        Post post = postService.findPostById(postId);
        return postLikeRepo.countByPost(post);
    }

    public boolean hasLiked(Integer postId, Integer userId, String anonymousId) {

        if (userId != null) {
            return postLikeRepo.existsByPost_PostIdAndUserId(postId, userId);
        }

        return postLikeRepo.existsByPost_PostIdAndAnonymousId(postId, anonymousId);
    }
}
