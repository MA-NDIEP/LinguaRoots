package com.example.postmanagement.service;

import com.example.postmanagement.dto.CommentDto;
import com.example.postmanagement.model.Comment;
import com.example.postmanagement.model.Reply;
import com.example.postmanagement.repository.ReplyRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReplyService {

    @Autowired
    private ReplyRepo replyRepo;

    public List<Reply> getAllReplies () {
        return replyRepo.findAllByIsDeletedFalse();
    }

    public List<Reply> getAllRepliesByCommentId(Integer commentId) {
        return replyRepo.findAllByCommentIdAndIsDeletedFalse(commentId);
    }

    public Reply addReply (CommentDto commentDto) {
        try{
            Reply reply = new Reply();
            reply.setCommentId(commentDto.getCommentId());
            reply.setUsername(commentDto.getUsername());
            reply.setContent(commentDto.getContent());
            reply.setIsLiked(false);
            reply.setIsDeleted(false);
            reply.setDatePublished(LocalDateTime.now());

            return replyRepo.save(reply);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public Reply updateReply(Comment comment){
        try{
            Reply reply = replyRepo.findById(comment.getCommentId()).get();
            reply.setContent(comment.getContent());
            reply.setDatePublished(LocalDateTime.now());
            return replyRepo.save(reply);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteReply(Integer id) {
        try{
            Reply reply = replyRepo.findById(id).get();
            reply.setIsDeleted(Boolean.TRUE);
            reply.setDateDeleted(LocalDateTime.now());

            replyRepo.save(reply);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
