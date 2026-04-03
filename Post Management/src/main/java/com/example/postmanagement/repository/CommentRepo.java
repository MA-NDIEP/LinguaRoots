package com.example.postmanagement.repository;

import com.example.postmanagement.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepo extends JpaRepository<Comment,Long> {
    List<Comment> getCommentsByPost_PostId(Integer postId);
    Comment getCommentByCommentId (Integer commentId);
}
