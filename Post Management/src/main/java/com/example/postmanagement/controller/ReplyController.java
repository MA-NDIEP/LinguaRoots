package com.example.postmanagement.controller;

import com.example.postmanagement.dto.CommentDto;
import com.example.postmanagement.model.Comment;
import com.example.postmanagement.model.Reply;
import com.example.postmanagement.service.ReplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/reply")
public class ReplyController {

    @Autowired
    private ReplyService replyService;

    @GetMapping("/all")
    public ResponseEntity<List<Reply>> getAllReplies(){
        try{
            List<Reply> replies = replyService.getAllReplies();
            if(replies.isEmpty()){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(replies, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @GetMapping("/all/{commentId}")
    public ResponseEntity<List<CommentDto>> getAllRepliesByCommentId(@PathVariable Integer commentId){
        try{
            List<Reply> replies = replyService.getAllRepliesByCommentId(commentId);
            List<CommentDto> commentDtos = new ArrayList<>();
            if(replies.isEmpty()){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            for (Reply reply : replies){

                CommentDto commentDto = new CommentDto();
                commentDto.setCommentId(reply.getId());
                commentDto.setUsername(reply.getUsername());
                commentDto.setContent(reply.getContent());
                commentDto.setIsLiked(reply.getIsLiked());
                commentDto.setDatePublished(reply.getDatePublished());
                commentDtos.add(commentDto);
            }

            return new ResponseEntity<>(commentDtos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Reply> addReply(@RequestBody CommentDto commentDto){
        try{
            Reply reply = replyService.addReply(commentDto);
            return new ResponseEntity<>(reply, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Reply> updateReply(@RequestBody Comment comment){
        try{
            Reply reply = replyService.updateReply(comment);
            return new ResponseEntity<>(reply, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteReply(@PathVariable Integer id){
        try{
            replyService.deleteReply(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
