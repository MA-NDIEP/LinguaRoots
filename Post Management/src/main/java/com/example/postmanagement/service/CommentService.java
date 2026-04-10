package com.example.postmanagement.service;

import com.example.postmanagement.dto.CommentDto;
import com.example.postmanagement.dto.CreateCommentDto;
import com.example.postmanagement.model.Comment;
import com.example.postmanagement.repository.CommentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepo commentRepo;

    public List<Comment> getAllCommentsByPostId (Integer postId) {
        return commentRepo.findByPostIdAndIsDeletedFalse(postId);
    }

    public Comment createComment(CreateCommentDto createCommentDto) {
        Comment comment = new Comment();

        comment.setUsername(createCommentDto.getUsername());
        comment.setContent(createCommentDto.getContent());
        comment.setIsLiked(Boolean.FALSE);
        comment.setDatePublished(LocalDateTime.now());
        comment.setIsDeleted(Boolean.FALSE);
        comment.setPostId(createCommentDto.getPostId());

        return commentRepo.save(comment);
    }

    public Comment UpdateComment (CommentDto comment){
        Comment existingComment = new Comment();

//        existingComment.setUsername(comment.getUsername());
        existingComment.setContent(comment.getContent());
//        existingComment.setIsLiked(comment.getIsLiked());
        existingComment.setDatePublished(LocalDateTime.now());

        return commentRepo.save(existingComment);
    }

    public Comment deleteComment(Integer commentId){
        Comment comment = commentRepo.findByCommentIdAndIsDeletedFalse(commentId);

        comment.setIsDeleted(Boolean.TRUE);
        comment.setDateDeleted(LocalDateTime.now());
        return commentRepo.save(comment);
    }

    public Comment likeComment (Integer commentId){
        Comment existingComment = commentRepo.findByCommentIdAndIsDeletedFalse(commentId);
        existingComment.setIsLiked(!existingComment.getIsLiked());
        return commentRepo.save(existingComment);
    }

    public CommentDto convertCommentToCommentDto(Comment comment){
        CommentDto commentDto = new CommentDto();
        commentDto.setCommentId(comment.getCommentId());
        commentDto.setUsername(comment.getUsername());
        commentDto.setContent(comment.getContent());
        commentDto.setDatePublished(comment.getDatePublished());
        commentDto.setIsLiked(comment.getIsLiked());
        return commentDto;
    }
}
