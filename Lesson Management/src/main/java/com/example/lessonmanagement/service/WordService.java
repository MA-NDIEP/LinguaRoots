package com.example.lessonmanagement.service;

import com.example.lessonmanagement.dto.WordDto;
import com.example.lessonmanagement.model.Word;
import com.example.lessonmanagement.repository.WordRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WordService {

    @Autowired
    private WordRepo wordRepo;

    public List<Word> getAllWords(){
        return wordRepo.findAll();
    }

    public Word createWord(WordDto  wordDto){
        Word newWord = new Word();

        newWord.setWord(wordDto.getWord());
        newWord.setTranslation(wordDto.getTranslation());
        newWord.setExample(wordDto.getExample());
        newWord.setExampleTranslation(wordDto.getExampleTranslation());
        newWord.setCreatedAT(LocalDateTime.now());

        return wordRepo.save(newWord);
    }

    public Word updateWord(Word word){
        Word existingWord = wordRepo.findById(word.getWordId())
                .orElseThrow(() -> new RuntimeException("Word not found with id: " + word.getWordId()));

        existingWord.setWord(word.getWord() != null ? word.getWord() : existingWord.getWord());
        existingWord.setTranslation(word.getTranslation() != null ? word.getTranslation() : existingWord.getTranslation());
        existingWord.setExample(word.getExample() != null ? word.getExample() : existingWord.getExample());
        existingWord.setExampleTranslation(word.getExampleTranslation() != null ? word.getExampleTranslation() : existingWord.getExampleTranslation());

        return wordRepo.save(existingWord);
    }

    public void deleteWord(Integer wordId){
        if (!wordRepo.existsById(wordId)) {
            throw new RuntimeException("Word not found with id: " + wordId);
        }
        wordRepo.deleteById(wordId);
    }

}
