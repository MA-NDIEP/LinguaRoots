package com.example.lessonmanagement.controller;

import com.example.lessonmanagement.dto.WordDto;
import com.example.lessonmanagement.model.Word;
import com.example.lessonmanagement.service.WordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/word")
public class WordController {

    @Value("${file.upload-dir}")
    private String UPLOAD_DIR;

//    String baseUrl = "http://localhost:8765/post/media";
    String baseUrl = "https://api.linguaroots.publicvm.com/post/media";

    @Autowired
    private WordService wordService;

    @GetMapping("/all")
    public ResponseEntity<List<Word>> getAllWords(){
        try{
            List<Word> words = wordService.getAllWords();
            for(Word word : words){
                word.setAudioUrl(baseUrl + "/" + word.getAudioUrl());
            }
            return new ResponseEntity<>(words, HttpStatus.OK);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @GetMapping("/media/{filename}")
    public ResponseEntity<Resource> getMedia(@PathVariable String filename) {
        try {
            Path path = Paths.get(UPLOAD_DIR).resolve(filename);
            Resource resource = new UrlResource(path.toUri());
            System.out.println("Looking for file: " + path.toAbsolutePath());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(path);

            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + filename + "\""
                    )
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Word> createWord(@ModelAttribute WordDto wordDto){
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
    public ResponseEntity<Word> updateWord(@ModelAttribute WordDto word){
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

    @DeleteMapping("/delete/{wordId}")
    public ResponseEntity<?> deleteWord(@PathVariable Integer wordId){
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
