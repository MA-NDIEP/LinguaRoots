package com.example.postmanagement.controller;

import com.example.postmanagement.dto.PostLikeRequest;
import com.example.postmanagement.service.PostLikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/like")
public class PostLikeController {

    @Autowired
    private PostLikeService postLikeService;

    @PostMapping("/like")
    public ResponseEntity<?> likePost(@RequestBody PostLikeRequest request) {

        postLikeService.likePost(
                request.getPostId(),
                request.getUserId(),
                request.getAnonymousId()
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/unlike")
    public ResponseEntity<?> unlikePost(@RequestBody PostLikeRequest request) {

        postLikeService.unlikePost(
                request.getPostId(),
                request.getUserId(),
                request.getAnonymousId()
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getLikes(@PathVariable Integer postId, @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String anonymousId) {
        try {

            Map<String, Object> response = new HashMap<>();

            response.put(
                    "likes",
                    postLikeService.getLikes(postId)
            );

            response.put(
                    "liked",
                    postLikeService.hasLiked(postId, userId, anonymousId)
            );

            return ResponseEntity.ok(response);
        }catch(Exception e){
            System.out.println("Error in PostLikeController getLikes"+e.getMessage());
            return ResponseEntity.badRequest().build();
        }


    }
}
