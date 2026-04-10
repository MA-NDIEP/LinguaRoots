package com.example.postmanagement.controller;

import com.example.postmanagement.dto.CommentDto;
import com.example.postmanagement.dto.PostComment;
import com.example.postmanagement.dto.CreatePostDto;
import com.example.postmanagement.dto.PostDto;
import com.example.postmanagement.model.Comment;
import com.example.postmanagement.model.Post;
import com.example.postmanagement.model.Type;
import com.example.postmanagement.service.CommentService;
import com.example.postmanagement.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/post")
public class PostController {

    private static final String UPLOAD_DIR = "uploads";

    String baseUrl = "http://localhost:8765/post/media";

    @Autowired
    private PostService postService;

    @Autowired
    private CommentService commentService;

    @GetMapping("/all")
    public ResponseEntity<List<PostComment>> getAllPosts(){
        try {

            List<Post> posts = postService.getAllPosts();
            List<PostComment> postComments = new ArrayList<>();

            for (Post post : posts) {
                List<Comment> comments = commentService.getAllCommentsByPostId(post.getPostId());
                List<CommentDto> commentDtos = new ArrayList<>();
                PostComment postComment = new PostComment();

                //Check this part of the code to make sure all the attributes are saved correctly based on the type
                postComment.setPostId(post.getPostId());
                postComment.setImage(baseUrl + "/" + post.getImage());

                if (post.getType() == Type.VIDEO) {
                    postComment.setVideo(baseUrl + "/" + post.getVideo());
                } else if (post.getType() == Type.AUDIO) {
                    postComment.setAudio(baseUrl + "/" + post.getAudio());
                }

                postComment.setTitle(post.getTitle());
                postComment.setContent(post.getContent());
                postComment.setTranslation(post.getTranslation());
                postComment.setType(post.getType());

                for (Comment comment : comments) {
                    CommentDto commentDto = commentService.convertCommentToCommentDto(comment);

                    commentDtos.add(commentDto);
                }

                postComment.setComments(commentDtos);

                postComments.add(postComment);
            }

            return new ResponseEntity<>(postComments, HttpStatus.OK);

        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @GetMapping("/media/{filename}")
    public ResponseEntity<Resource> getMedia(@PathVariable String filename) {
        try {
            Path path = Paths.get(UPLOAD_DIR).resolve(filename);
            Resource resource = new UrlResource(path.toUri());
            System.out.println("Looking for file: " + path.toAbsolutePath());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(path);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Post> createPost(@ModelAttribute CreatePostDto createPostDto){
        try{
            Post newPost = postService.createPost(createPostDto);
            if (newPost == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(newPost, HttpStatus.CREATED);
        } catch (Exception e) {
            System.out.println("Create Post Exception: " + e);
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Post> updatePost (@ModelAttribute PostDto post){
        try{
            Post updatedPost = postService.updatePost(post);
            if (updatedPost == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(updatedPost, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("Update Post Exception: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deletePost (@RequestParam Integer postId){
        try{
            postService.deletePost(postId);

            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }


}
