package com.example.postmanagement.service;

import com.example.postmanagement.dto.CreatePostDto;
import com.example.postmanagement.dto.PostDto;
import com.example.postmanagement.model.Comment;
import com.example.postmanagement.model.Post;
import com.example.postmanagement.repository.PostRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class PostService {

    private static final String UPLOAD_DIR = "uploads";

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private CommentService  commentService;

    public List<Post> getAllPosts(){
        return postRepo.findAll();
    }

    public Post findPostById (Integer postId) {
        return postRepo.findById(postId).get();
    }

    public Post createPost (CreatePostDto createPostDto){
        try {

            Post post = new Post();

            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }

            post.setTitle(createPostDto.getTitle());
            post.setContent(createPostDto.getContent());
            post.setTranslation(createPostDto.getTranslation());
            post.setType(createPostDto.getType());
            if (createPostDto.getImage() != null) {
                post.setImage(saveMediaFile(createPostDto.getImage()));
                post.setVideo("");
            } else {
                post.setVideo(saveMediaFile(createPostDto.getVideo()));
                post.setImage("");
            }

            return postRepo.save(post);
        }catch (IOException e){
            throw new RuntimeException(e);
        }
    }

    public Post updatePost (PostDto post){
        try {

            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }

            Post existingPost = postRepo.findById(post.getPostId()).get();

            existingPost.setTitle(post.getTitle());
            existingPost.setContent(post.getContent());
            existingPost.setTranslation(post.getTranslation());
            existingPost.setType(post.getType());


            if (post.getImage() != null) {
                Files.deleteIfExists(Paths.get(UPLOAD_DIR).resolve(existingPost.getImage()));

                existingPost.setImage(saveMediaFile(post.getImage()));
                existingPost.setVideo("");
            } else {
                Files.deleteIfExists(Paths.get(UPLOAD_DIR).resolve(existingPost.getVideo()));
                existingPost.setVideo(saveMediaFile(post.getVideo()));
                existingPost.setImage("");
            }

            return postRepo.save(existingPost);
        }catch (IOException e){
            throw new RuntimeException(e);
        }
    }

    public void deletePost (Integer postId) {
        Post post = postRepo.findById(postId).get();

        List<Comment> comments = commentService.getAllCommentsByPostId(postId);
        for (Comment comment : comments) {
            commentService.deleteComment(comment.getCommentId());
        }

        postRepo.delete(post);
    }


    public String saveMediaFile(MultipartFile file) throws IOException {
        // 1. Sanitize and create a unique name
        String cleanName = StringUtils.cleanPath(file.getOriginalFilename());
        String uniqueName = UUID.randomUUID().toString() + "_" + cleanName;

        // 2. Define the path (relative to your upload root)
        Path targetPath = Paths.get(UPLOAD_DIR).resolve(uniqueName).normalize();

        // 3. Stream the file to disk (Efficient for both Audio & Video)
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // 4. Return the unique name or relative path to save in your DB VARCHAR
        return uniqueName;
    }

}
