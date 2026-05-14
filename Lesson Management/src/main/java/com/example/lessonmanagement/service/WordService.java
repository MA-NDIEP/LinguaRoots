package com.example.lessonmanagement.service;

import com.example.lessonmanagement.dto.WordDto;
import com.example.lessonmanagement.model.Word;
import com.example.lessonmanagement.repository.WordRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class WordService {

    @Value("${file.upload-dir}")
    private String UPLOAD_DIR;

    @Autowired
    private WordRepo wordRepo;

    public List<Word> getAllWords(){
        return wordRepo.findAll();
    }

    public Word createWord(WordDto  wordDto){
        try{

            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }

            Word newWord = new Word();

            newWord.setWord(wordDto.getWord());
            newWord.setTranslation(wordDto.getTranslation());
            newWord.setExample(wordDto.getExample());
            newWord.setExampleTranslation(wordDto.getExampleTranslation());
            newWord.setAudioUrl(saveMediaFile(wordDto.getAudioUrl()));
            newWord.setCreatedAT(LocalDateTime.now());

            return wordRepo.save(newWord);
        }catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    public Word updateWord(WordDto word){
        try{
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }

            Word existingWord = wordRepo.findById(word.getWordId())
                    .orElseThrow(() -> new RuntimeException("Word not found with id: " + word.getWordId()));

            existingWord.setWord(word.getWord() != null ? word.getWord() : existingWord.getWord());
            existingWord.setTranslation(word.getTranslation() != null ? word.getTranslation() : existingWord.getTranslation());
            existingWord.setExample(word.getExample() != null ? word.getExample() : existingWord.getExample());
            existingWord.setExampleTranslation(word.getExampleTranslation() != null ? word.getExampleTranslation() : existingWord.getExampleTranslation());

            if (word.getAudioUrl() != null && !word.getAudioUrl().isEmpty()) {
                if (existingWord.getAudioUrl() == null){
                    existingWord.setAudioUrl(saveMediaFile(word.getAudioUrl()));
                }
                Files.deleteIfExists(Paths.get(UPLOAD_DIR).resolve(existingWord.getAudioUrl()));
                existingWord.setAudioUrl(saveMediaFile(word.getAudioUrl()));
            }

            return wordRepo.save(existingWord);
        }catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    public void deleteWord(Integer wordId){
        if (!wordRepo.existsById(wordId)) {
            throw new RuntimeException("Word not found with id: " + wordId);
        }
        wordRepo.deleteById(wordId);
    }

    public String saveMediaFile(MultipartFile file) throws IOException {
        // 1. Sanitize and create a unique name
        String cleanName = StringUtils.cleanPath(file.getOriginalFilename());
        String uniqueName = UUID.randomUUID().toString() + "_" + cleanName;

        // 2. Define the path (relative to your upload root)
        Path targetPath = Paths.get(UPLOAD_DIR).resolve(uniqueName).normalize();

        // 3. Stream the file to disk (Efficient for both Audio & Video)
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // 4. Return the unique name or relative path to save in your DB VARCHAR
        return uniqueName;
    }

}
