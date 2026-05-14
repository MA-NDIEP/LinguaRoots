package com.example.lessonmanagement.controller;

import com.example.lessonmanagement.dto.AlphabetDto;
import com.example.lessonmanagement.model.Alphabet;
import com.example.lessonmanagement.service.AlphabetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alphabet")
public class AlphabetController {

    @Autowired
    private AlphabetService alphabetService;

    @GetMapping("/all")
    public ResponseEntity<List<Alphabet>> getAllAlphabets() {
        try {
            List<Alphabet> alphabets = alphabetService.getAllAlphabets();

            return ResponseEntity.ok(alphabets);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Alphabet> createAlphabet(@RequestBody AlphabetDto alphabetDto) {
        try {
            if (alphabetDto.getCharacter() != null || alphabetDto.getNativePronunciation() != null ||
                    alphabetDto.getEnglishEquivalent() != null || alphabetDto.getNativeExample() != null ||
                    alphabetDto.getEnglishExample() != null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);

            }
            return new ResponseEntity<>(alphabetService.createAlphabet(alphabetDto), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Alphabet> updateAlphabet(@RequestBody AlphabetDto alphabet) {
        try {
            if (alphabet.getId() == null || alphabet.getCharacter() != null || alphabet.getNativePronunciation() != null ||
                    alphabet.getEnglishEquivalent() != null || alphabet.getNativeExample() != null ||
                    alphabet.getEnglishExample() != null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);

            }
            return new ResponseEntity<>(alphabetService.updateAlphabet(alphabet), HttpStatus.OK);
        } catch (Exception e) {
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
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
