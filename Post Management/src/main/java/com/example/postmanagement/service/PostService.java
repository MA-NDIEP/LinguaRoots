package com.example.postmanagement.service;

import com.example.postmanagement.dto.ContentChartDto;
import com.example.postmanagement.dto.CreatePostDto;
import com.example.postmanagement.dto.PostDto;
import com.example.postmanagement.feign.LessonManagementInterface;
import com.example.postmanagement.model.Comment;
import com.example.postmanagement.model.Lesson;
import com.example.postmanagement.model.Post;
import com.example.postmanagement.model.Type;
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
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class PostService {

    private static final String UPLOAD_DIR = "uploads";

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private CommentService  commentService;

    @Autowired
    private LessonManagementInterface lessonManagementInterface;

    public List<Post> getAllPosts(){
        return postRepo.findAll();
    }

    public Post findPostById (Integer postId) {
        return postRepo.findById(postId).get();
    }

    public Post createPost (CreatePostDto createPostDto){
        try {
            System.out.println("Received CreatePostDto: " + createPostDto);

            Post post = new Post();

            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }

            post.setTitle(createPostDto.getTitle());

            if(createPostDto.getContent() != null){
                post.setContent(createPostDto.getContent());
            }

            post.setTranslation(createPostDto.getTranslation());
            post.setType(createPostDto.getType());

            post.setImage(saveMediaFile(createPostDto.getImage()));

            if (createPostDto.getGalleryImageFiles() != null && !createPostDto.getGalleryImageFiles().isEmpty()) {
                List<String> imageUrls = new ArrayList<>();
                for (MultipartFile multipartFile : createPostDto.getGalleryImageFiles()) {
                    // Double check individual files aren't empty
                    if (multipartFile != null && !multipartFile.isEmpty()) {
                        imageUrls.add(saveMediaFile(multipartFile));
                    }
                }
                post.setGalleryImageFiles(imageUrls);
            }

            if (createPostDto.getType() == Type.RIDDLE && createPostDto.getRiddleAnswer() != null){
                post.setRiddleAnswer(createPostDto.getRiddleAnswer());
            }
            if(createPostDto.getAudio() != null ){
                post.setAudio(saveMediaFile(createPostDto.getAudio()));
            }
            if(createPostDto.getVideo() != null) {
                post.setVideo(saveMediaFile(createPostDto.getVideo()));
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

            existingPost.setTitle(post.getTitle() != null ? post.getTitle() : existingPost.getTitle());
            existingPost.setContent(post.getContent() != null ? post.getContent() : existingPost.getContent());
            existingPost.setTranslation(post.getTranslation() != null ? post.getTranslation() : existingPost.getTranslation());
            existingPost.setType(post.getType() != null ? post.getType() : existingPost.getType());

            if (post.getImage() != null) {
                Files.deleteIfExists(Paths.get(UPLOAD_DIR).resolve(existingPost.getImage()));
                existingPost.setImage(saveMediaFile(post.getImage()));
            }else {
                existingPost.setImage(existingPost.getImage());
            }

            if (existingPost.getType() == Type.RIDDLE && post.getRiddleAnswer() != null) {
                existingPost.setRiddleAnswer(post.getRiddleAnswer());
            }

            if (existingPost.getType() == Type.STORY && post.getGalleryImageFiles() != null) {
                List<String> imageUrls = new ArrayList<>();
                for (String file : existingPost.getGalleryImageFiles()){
                    Files.deleteIfExists(Paths.get(UPLOAD_DIR).resolve(file));
                }

                for (MultipartFile multipartFile : post.getGalleryImageFiles()){
                    imageUrls.add(saveMediaFile(multipartFile));
                }

                existingPost.setGalleryImageFiles(imageUrls);
            }

            return postRepo.save(existingPost);
        }catch (IOException e){
            System.out.println("Error updating post: " + e.getMessage());
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
        String cleanName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String uniqueName = UUID.randomUUID().toString() + "_" + cleanName;

        // 2. Define the path (relative to your upload root)
        Path targetPath = Paths.get(UPLOAD_DIR).resolve(uniqueName).normalize();

        // 3. Stream the file to disk (Efficient for both Audio & Video)
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // 4. Return the unique name or relative path to save in your DB VARCHAR
        return uniqueName;
    }

    public ContentChartDto getContentStats() {

        List<Lesson> lessonsList = lessonManagementInterface.getAllLessons().getBody();
        List<Post> postsList = postRepo.findAll();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        Map<String, Long> lessonMap = new TreeMap<>();
        Map<String, Long> postMap = new TreeMap<>();

        // Group lessons
        for (Lesson l : lessonsList) {

            if (l.getCreatedAt() == null) continue;

            String month = l.getCreatedAt().format(formatter);

            lessonMap.put(month, lessonMap.getOrDefault(month, 0L) + 1);
        }

        // Group posts
        for (Post p : postsList) {

            if (p.getCreatedAt() == null) continue;

            String month = p.getCreatedAt().format(formatter);

            postMap.put(month, postMap.getOrDefault(month, 0L) + 1);
        }

        // Merge labels (important!)
        Set<String> allMonths = new TreeSet<>();
        allMonths.addAll(lessonMap.keySet());
        allMonths.addAll(postMap.keySet());

        List<String> labels = new ArrayList<>(allMonths);

        List<Long> lessons = new ArrayList<>();
        List<Long> posts = new ArrayList<>();

        for (String month : labels) {

            lessons.add(lessonMap.getOrDefault(month, 0L));

            posts.add(postMap.getOrDefault(month, 0L));
        }

        return new ContentChartDto(labels, lessons, posts);
    }

}
