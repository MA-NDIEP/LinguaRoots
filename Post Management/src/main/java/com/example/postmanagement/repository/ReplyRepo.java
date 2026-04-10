package com.example.postmanagement.repository;

import com.example.postmanagement.model.Reply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReplyRepo extends JpaRepository<Reply,Integer> {
    List<Reply> findAllByIsDeletedFalse();
    List<Reply> findAllByCommentIdAndIsDeletedFalse(Integer commentId);
}
