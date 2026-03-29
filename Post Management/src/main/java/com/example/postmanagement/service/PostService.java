package com.example.postmanagement.service;

import com.example.postmanagement.dto.PostDto;
import com.example.postmanagement.model.Post;
import com.example.postmanagement.repository.PostRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepo postRepo;

    public List<Post> getAllPosts(){
        return postRepo.findAll();
    }

    public Post findPostById (Integer postId) {
        return postRepo.findById(postId).get();
    }

    public Post createPost (PostDto postDto){
        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setTranslation(postDto.getTranslation());
        post.setType(postDto.getType());
        if(postDto.getImage() != null){
            post.setImage(postDto.getImage());
            post.setVideo("");
        }else {
            post.setVideo(postDto.getVideo());
            post.setImage("");
        }

        return postRepo.save(post);
    }

    public Post updatePost (Post post){
        Post existingPost = postRepo.findById(post.getPostId()).get();

        existingPost.setTitle(post.getTitle());
        existingPost.setContent(post.getContent());
        existingPost.setTranslation(post.getTranslation());
        existingPost.setType(post.getType());
        if(post.getImage() != null){
            existingPost.setImage(post.getImage());
            existingPost.setVideo("");
        }else {
            existingPost.setVideo(post.getVideo());
            existingPost.setImage("");
        }

        return postRepo.save(existingPost);
    }

    public void deletePost (Integer postId) {
        Post post = postRepo.findById(postId).get();

        postRepo.delete(post);
    }
}
