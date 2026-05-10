package com.example.postmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
//@AllArgsConstructor
@Builder
public class ContentChartDto {

    private List<String> labels;

    private List<Long> lessons;

    private List<Long> posts;

    public ContentChartDto(List<String> labels, List<Long> lessons, List<Long> posts) {
        this.labels = labels;
        this.lessons = lessons;
        this.posts = posts;
    }
}
