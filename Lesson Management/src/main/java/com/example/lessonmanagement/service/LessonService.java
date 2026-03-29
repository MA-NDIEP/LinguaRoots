package com.example.lessonmanagement.service;

import com.example.lessonmanagement.dto.LessonDto;
import com.example.lessonmanagement.model.Lesson;
import com.example.lessonmanagement.repository.LessonRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonService {

    @Autowired
    private LessonRepo lessonRepo;

    public List<Lesson> getAllLessons() {
        return lessonRepo.findAll();
    }

    public Lesson getLessonById(Integer id) {
        return lessonRepo.findById(id).get();
    }

    public Lesson addLesson(LessonDto lessonDto) {
        Lesson lesson = new Lesson();

        lesson.setType(lessonDto.getLessonType());
        lesson.setTitle(lessonDto.getTitle());
        lesson.setContent(lessonDto.getContent());
        lesson.setPronunciation(lessonDto.getPronunciation());
        lesson.setWrittenPronunciation(lessonDto.getWrittenPronunciation());
        lesson.setEnglishEquivalent(lessonDto.getEnglishEquivalent());
        lesson.setExample(lessonDto.getExample());

        return lessonRepo.save(lesson);
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
