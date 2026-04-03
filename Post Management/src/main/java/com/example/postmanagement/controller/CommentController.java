package com.example.postmanagement.controller;

import com.example.postmanagement.dto.CommentDto;
import com.example.postmanagement.dto.CreateCommentDto;
import com.example.postmanagement.model.Comment;
import com.example.postmanagement.service.CommentService;
import com.example.postmanagement.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/comment")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private PostService postService;

    @GetMapping("/{postId}")
    private ResponseEntity<List<CommentDto>> getCommentsForPost(@PathVariable Integer postId){
        try{
            List<Comment> comments = commentService.getAllCommentsByPostId(postId);
            if(comments.isEmpty()){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            List<CommentDto> commentDtos = new ArrayList<>();
            for(Comment comment : comments){
                CommentDto commentDto = commentService.convertCommentToCommentDto(comment);

                commentDtos.add(commentDto);
            }
            return new ResponseEntity<>(commentDtos, HttpStatus.OK);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PostMapping("/add")
    private ResponseEntity<Comment> createComment(@RequestBody CreateCommentDto commentDto ){
        try{
            Comment newComment = commentService.createComment(commentDto);
            if(newComment == null){
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(newComment, HttpStatus.CREATED);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PutMapping("/update")
    private ResponseEntity<Comment>  updateComment(@RequestBody CommentDto comment){
        try{
            Comment updatedComment = commentService.UpdateComment(comment);
            if(updatedComment == null){
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(updatedComment, HttpStatus.OK);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @DeleteMapping("/delete")
    private ResponseEntity<Comment>  deleteComment(@RequestBody CommentDto comment){
        try{
            Comment deletedComment = commentService.deleteComment(comment.getCommentId());
            if(deletedComment == null){
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(deletedComment, HttpStatus.NO_CONTENT);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PostMapping("/like")
    private ResponseEntity<Comment> likeComment(@RequestBody CommentDto  comment){
        try{
            Comment likedComment = commentService.likeComment(comment.getCommentId());

            if(likedComment == null){
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(likedComment, HttpStatus.OK);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

}
