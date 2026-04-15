package com.example.lessonmanagement.service;

import com.example.lessonmanagement.dto.LessonDto;
import com.example.lessonmanagement.dto.UpdateLessonDto;
import com.example.lessonmanagement.model.Lesson;
import com.example.lessonmanagement.model.Status;
import com.example.lessonmanagement.repository.LessonRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

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
            System.out.println("Received AddLessonDto: " + lessonDto);
            Lesson lesson = new Lesson();

            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }

            lesson.setType(lessonDto.getType());
            lesson.setTitle(lessonDto.getTitle());
            lesson.setContent(lessonDto.getContent());
            lesson.setPronunciation(saveMediaFile(lessonDto.getPronunciation()));
            lesson.setWrittenPronunciation(lessonDto.getWrittenPronunciation());
            lesson.setEnglishEquivalent(lessonDto.getEnglishEquivalent());
            lesson.setExample(lessonDto.getExample());
            lesson.setStatus(Status.PUBLISHED);
            lesson.setLessonOrder(lessonDto.getLessonOrder());

            return lessonRepo.save(lesson);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public Lesson updateLesson(UpdateLessonDto lesson) {
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }

            Lesson existingLesson = lessonRepo.findById(lesson.getLessonId()).get();

            existingLesson.setType(lesson.getType() != null ? lesson.getType() : existingLesson.getType());
            existingLesson.setTitle(lesson.getTitle() != null ? lesson.getTitle() : existingLesson.getTitle());
            existingLesson.setContent(lesson.getContent() != null ? lesson.getContent() : existingLesson.getContent());

            if (lesson.getPronunciation() != null && !lesson.getPronunciation().isEmpty()) {
                Files.deleteIfExists(Paths.get(UPLOAD_DIR).resolve(existingLesson.getPronunciation()));
                existingLesson.setPronunciation(saveMediaFile(lesson.getPronunciation()));
            }

            existingLesson.setWrittenPronunciation(lesson.getWrittenPronunciation() != null ? lesson.getWrittenPronunciation() : existingLesson.getWrittenPronunciation());
            existingLesson.setEnglishEquivalent(lesson.getEnglishEquivalent() != null ? lesson.getEnglishEquivalent() : existingLesson.getEnglishEquivalent());
            existingLesson.setExample(lesson.getExample() != null ? lesson.getExample() : existingLesson.getExample());
            existingLesson.setStatus(lesson.getStatus() != null ? lesson.getStatus() : existingLesson.getStatus());
            existingLesson.setLessonOrder(lesson.getLessonOrder() != null ? lesson.getLessonOrder() : existingLesson.getLessonOrder());

            return lessonRepo.save(existingLesson);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    public void isPublished(Integer lessonId) {
        Lesson lesson = lessonRepo.findById(lessonId).get();

        if(lesson.getStatus() == Status.PUBLISHED) {
            lesson.setStatus(Status.DRAFT);
        }else {
            lesson.setStatus(Status.PUBLISHED);
        }
        lessonRepo.save(lesson);
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
