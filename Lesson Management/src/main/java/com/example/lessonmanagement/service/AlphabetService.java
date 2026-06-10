package com.example.lessonmanagement.service;

import com.example.lessonmanagement.dto.AlphabetDto;
import com.example.lessonmanagement.model.Alphabet;
import com.example.lessonmanagement.repository.AlphabetRepo;
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
import java.util.List;
import java.util.UUID;

@Service
public class AlphabetService {

    @Value("${file.upload-dir}")
    private String UPLOAD_DIR;

    @Autowired
    private AlphabetRepo alphabetRepo;

    public List<Alphabet> getAllAlphabets() {
        return alphabetRepo.findAll();
    }

    public Alphabet createAlphabet(AlphabetDto alphabet) {
        try{
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }

            Alphabet newAlphabet = new Alphabet();

            newAlphabet.setCharacter(alphabet.getCharacter());

            if (alphabet.getNativePronunciation() != null) {
                newAlphabet.setNativePronunciation(saveMediaFile(alphabet.getNativePronunciation()));
            }
            if (alphabet.getEnglishEquivalent() != null) {
                newAlphabet.setEnglishEquivalent(alphabet.getEnglishEquivalent());
            }
            if(alphabet.getNativeExample() != null) {
                newAlphabet.setNativeExample(alphabet.getNativeExample());
            }
            if(alphabet.getEnglishExample() != null) {
                newAlphabet.setEnglishExample(alphabet.getEnglishExample());
            }

            return alphabetRepo.save(newAlphabet);
        }catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    public Alphabet updateAlphabet(AlphabetDto alphabet) {
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }

            Alphabet existingAlphabet = alphabetRepo.findById(alphabet.getId())
                    .orElseThrow(() -> new RuntimeException("Alphabet not found with id: " + alphabet.getId()));

            existingAlphabet.setCharacter(alphabet.getCharacter());

            // Handle audio deletion if requested
            if (alphabet.getAudioDeleted() != null && alphabet.getAudioDeleted()) {
                // Delete existing audio file
                String currentAudioPath = existingAlphabet.getNativePronunciation();
                if (currentAudioPath != null && !currentAudioPath.isEmpty()) {
                    Path audioFile = Paths.get(UPLOAD_DIR).resolve(currentAudioPath);
                    try {
                        Files.deleteIfExists(audioFile);
                        System.out.println("Deleted audio file: " + currentAudioPath);
                    } catch (IOException e) {
                        System.err.println("Failed to delete audio file: " + e.getMessage());
                    }
                }
                existingAlphabet.setNativePronunciation(null);
            }

            // Handle new audio upload (this replaces any existing audio)
            if (alphabet.getNativePronunciation() != null && !alphabet.getNativePronunciation().isEmpty()) {
                // Delete old audio if exists
                String currentAudioPath = existingAlphabet.getNativePronunciation();
                if (currentAudioPath != null && !currentAudioPath.isEmpty()) {
                    Path oldAudioFile = Paths.get(UPLOAD_DIR).resolve(currentAudioPath);
                    Files.deleteIfExists(oldAudioFile);
                }
                // Save new audio
                existingAlphabet.setNativePronunciation(saveMediaFile(alphabet.getNativePronunciation()));
            }

            existingAlphabet.setEnglishEquivalent(alphabet.getEnglishEquivalent());
            existingAlphabet.setNativeExample(alphabet.getNativeExample());
            existingAlphabet.setEnglishExample(alphabet.getEnglishExample());

            return alphabetRepo.save(existingAlphabet);

        } catch (IOException e) {
            throw new RuntimeException("Failed to update alphabet: " + e.getMessage(), e);
        }
    }

    public void deleteAlphabet(Integer id) {
        if (!alphabetRepo.existsById(id)) {
            throw new RuntimeException("Alphabet not found with id: " + id);
        }
        alphabetRepo.deleteById(id);
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
