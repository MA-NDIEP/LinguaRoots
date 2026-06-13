package com.example.postmanagement.repository;

import com.example.postmanagement.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepo extends JpaRepository<Comment,Integer> {
    List<Comment> findByPostIdAndIsDeletedFalse(Integer postId);
    List<Comment> findByPostId(Integer postId);
    Comment findByCommentIdAndIsDeletedFalse(Integer commentId);
}
