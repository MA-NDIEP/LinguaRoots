package com.example.linguaroots.service;

import com.example.linguaroots.model.Student;
import com.example.linguaroots.repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
    @Autowired
    private StudentRepo studentRepo;

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

}
