package com.example.postmanagement.repository;

import com.example.postmanagement.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepo extends JpaRepository<Post, Integer> {

}
