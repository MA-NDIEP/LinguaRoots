package com.example.linguaroots.service;

import com.example.linguaroots.dto.ChartDto;
import com.example.linguaroots.model.Student;
import com.example.linguaroots.model.User;
import com.example.linguaroots.repository.StudentRepo;
import com.example.linguaroots.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class StudentService {
    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private UserService userService;

    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    public Student getStudentById(Integer studentId) {
        return studentRepo.findById(studentId).get();
    }

    public Student getStudentByUsername(String username) {
        return studentRepo.findByUsername(username);
    }

    public Student getStudentByEmail(String email) {
        return studentRepo.findByEmail(email);
    }

    public Student createStudent(Student student) {
        return studentRepo.save(student);
    }

    public Student updateStudent(Integer studentId, Student student) {
        Student existingStudent = studentRepo.findById(studentId).get();
        existingStudent.setUsername(student.getUsername());
        existingStudent.setEmail(student.getEmail());
        existingStudent.setPassword(student.getPassword());
        return studentRepo.save(existingStudent);
    }

    public Student deactivateStudent(Integer studentId) {
        Student existingStudent = studentRepo.findById(studentId).get();
        existingStudent.setIsActive(!existingStudent.getIsActive());
        return studentRepo.save(existingStudent);
    }

    public ChartDto getMonthlyRegistrations() {

        List<User> users = userService.findAllUsers();

        // Map: "2026-01" -> count
        Map<String, Long> grouped = new TreeMap<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (User user : users) {

            if (user.getCreatedAt() == null) continue;

            String month = user.getCreatedAt().format(formatter);

            grouped.put(month, grouped.getOrDefault(month, 0L) + 1);
        }

        List<String> labels = new ArrayList<>(grouped.keySet());
        List<Long> values = new ArrayList<>(grouped.values());

        return new ChartDto(labels, values);
    }

}
