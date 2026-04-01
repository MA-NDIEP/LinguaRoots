package com.example.lessonmanagement.service;

import com.example.lessonmanagement.dto.LessonDto;
import com.example.lessonmanagement.model.Lesson;
import com.example.lessonmanagement.repository.LessonRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Objects;

@Service
public class LessonService {

    private static final String UPLOAD_DIR = "uploads";

    @Autowired
    private LessonRepo lessonRepo;

    public List<Lesson> getAllLessons() {
        return lessonRepo.findAll();
    }

    public Lesson getLessonById(Integer id) {
        return lessonRepo.findById(id).get();
    }

    public Lesson addLesson(LessonDto lessonDto) {
        try {
            Lesson lesson = new Lesson();

            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }
            Path filePath = Path.of(UPLOAD_DIR, Objects.requireNonNull(lessonDto.getPronunciation().getOriginalFilename()));
            Files.write(filePath, lessonDto.getPronunciation().getBytes());

            lesson.setType(lessonDto.getLessonType());
            lesson.setTitle(lessonDto.getTitle());
            lesson.setContent(lessonDto.getContent());
            lesson.setPronunciation(String.valueOf(filePath));
            lesson.setWrittenPronunciation(lessonDto.getWrittenPronunciation());
            lesson.setEnglishEquivalent(lessonDto.getEnglishEquivalent());
            lesson.setExample(lessonDto.getExample());

            return lessonRepo.save(lesson);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public Lesson updateLesson(Lesson lesson) {

        Lesson existingLesson = lessonRepo.findById(lesson.getLessonId()).get();

        existingLesson.setType(lesson.getType());
        existingLesson.setTitle(lesson.getTitle());
        existingLesson.setContent(lesson.getContent());
        existingLesson.setPronunciation(lesson.getPronunciation());
        existingLesson.setWrittenPronunciation(lesson.getWrittenPronunciation());
        existingLesson.setEnglishEquivalent(lesson.getEnglishEquivalent());
        existingLesson.setExample(lesson.getExample());

        return lessonRepo.save(lesson);

    }

    public void deleteLesson(Integer lessonId) {
        lessonRepo.deleteById(lessonId);
    }
}
