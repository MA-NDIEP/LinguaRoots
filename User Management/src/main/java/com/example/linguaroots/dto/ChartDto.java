package com.example.linguaroots.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
//@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChartDto {

    private List<String> labels;
    private List<Long> values;

    public ChartDto(List<String> labels, List<Long> values) {
        this.labels = labels;
        this.values = values;
    }
}
