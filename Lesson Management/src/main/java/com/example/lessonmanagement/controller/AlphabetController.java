package com.example.lessonmanagement.controller;

import com.example.lessonmanagement.dto.AlphabetDto;
import com.example.lessonmanagement.model.Alphabet;
import com.example.lessonmanagement.service.AlphabetService;
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
@RequestMapping("/alphabet")
public class AlphabetController {

    @Value("${file.upload-dir}")
    private String UPLOAD_DIR;

//    String baseUrl = "http://localhost:8765/post/media";
    String baseUrl = "https://api.linguaroots.publicvm.com/alphabet/media";

    @Autowired
    private AlphabetService alphabetService;

    @GetMapping("/all")
    public ResponseEntity<List<Alphabet>> getAllAlphabets() {
        try {
            List<Alphabet> alphabets = alphabetService.getAllAlphabets();

            for (Alphabet alphabet : alphabets) {
                if (alphabet.getNativePronunciation() != null) {
                    alphabet.setNativePronunciation(baseUrl + "/" + alphabet.getNativePronunciation());
                }
            }

            return ResponseEntity.ok(alphabets);
        } catch (Exception e) {
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
    public ResponseEntity<Alphabet> createAlphabet(@ModelAttribute AlphabetDto alphabetDto) {
        try {
            if (alphabetDto.getCharacter() == null || alphabetDto.getNativePronunciation() == null ||
                    alphabetDto.getEnglishEquivalent() == null || alphabetDto.getNativeExample() == null ||
                    alphabetDto.getEnglishExample() == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);

            }
            return new ResponseEntity<>(alphabetService.createAlphabet(alphabetDto), HttpStatus.CREATED);
        } catch (Exception e) {
            System.out.println("Error creating alphabet: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Alphabet> updateAlphabet(@ModelAttribute AlphabetDto alphabet) {
        try {
            System.out.println("alphabet = " + alphabet);
            if (alphabet.getId() == null || alphabet.getCharacter() == null || alphabet.getEnglishEquivalent() == null
                    || alphabet.getNativeExample() == null ||
                    alphabet.getEnglishExample() == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);

            }
            return new ResponseEntity<>(alphabetService.updateAlphabet(alphabet), HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("Error updating alphabet: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteAlphabet(@PathVariable Integer id) {
        try{
            if (id == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            alphabetService.deleteAlphabet(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }catch (Exception e){
            System.out.println("Error deleting alphabet: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
