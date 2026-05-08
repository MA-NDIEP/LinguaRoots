package com.example.lessonmanagement.controller;

import com.example.lessonmanagement.dto.WordDto;
import com.example.lessonmanagement.model.Word;
import com.example.lessonmanagement.service.WordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/word")
public class WordController {

    @Autowired
    private WordService wordService;

    @GetMapping("/all")
    public ResponseEntity<List<Word>> getAllWords(){
        try{
            return new ResponseEntity<>(wordService.getAllWords(), HttpStatus.OK);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Word> createWord(@RequestBody WordDto wordDto){
        try{
            if (wordDto.getWord() == null || wordDto.getTranslation() == null ||
                    wordDto.getExample() == null || wordDto.getExampleTranslation() == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            return new ResponseEntity<>(wordService.createWord(wordDto), HttpStatus.CREATED);
        }catch(Exception e){
            System.out.println("Error creating word: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Word> updateWord(@RequestBody Word word){
        try{
            if (word.getWordId() == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            return new ResponseEntity<>(wordService.updateWord(word), HttpStatus.OK);
        }catch(Exception e){
            System.out.println("Error updating word: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteWord(@RequestParam Integer wordId){
        try{
            if (wordId == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            wordService.deleteWord(wordId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }catch(Exception e){
            System.out.println("Error deleting word: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
