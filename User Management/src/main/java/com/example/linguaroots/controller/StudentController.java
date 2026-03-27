package com.example.linguaroots.controller;

import com.example.linguaroots.config.PasswordConfig;
import com.example.linguaroots.dto.NewStudentDto;
import com.example.linguaroots.model.CustomUserPrincipal;
import com.example.linguaroots.model.Student;
import com.example.linguaroots.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private PasswordConfig passwordEncoder;

//    @GetMapping("/home")
//    public String student() {
//        return "Welcome Student";
//    }

    @GetMapping("/home")
    public String home(@AuthenticationPrincipal CustomUserPrincipal user) {

        Integer userId = user.getId();
        return "User ID: " + userId;
    }

    @GetMapping("/me")
    public String currentUser(Authentication authentication) {
        return "Logged in as: " + authentication.getName();
    }

    @GetMapping("/all")
    public ResponseEntity<List<Student>> getAllStudents() {
        try{
            List<Student> students = studentService.getAllStudents();
            if(students.isEmpty()){
                return ResponseEntity.noContent().build();
            }
            return new ResponseEntity<>(students, HttpStatus.OK);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Student> createStudent(@RequestBody NewStudentDto student) {
        try{
            Student newStudent = new Student();
            newStudent.setUsername(student.getUsername());
            newStudent.setEmail(student.getEmail());
            newStudent.setPassword(passwordEncoder.passwordEncoder().encode(student.getPassword()));
            newStudent.setIsActive(true);

            return new ResponseEntity<>(studentService.createStudent(newStudent), HttpStatus.CREATED);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Student> updateStudent(@RequestBody Student student) {
        try{
            Student existingStudent = studentService.getStudentById(student.getId());

            if(existingStudent == null){
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(studentService.updateStudent(existingStudent.getId(), existingStudent), HttpStatus.OK);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @PostMapping("/deactivate")
    public ResponseEntity<Student> deactivateStudent(@RequestParam Integer studentId) {
        try{
            Student existingStudent = studentService.getStudentById(studentId);
            if(existingStudent == null){
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(studentService.deactivateStudent(studentId), HttpStatus.OK);
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
