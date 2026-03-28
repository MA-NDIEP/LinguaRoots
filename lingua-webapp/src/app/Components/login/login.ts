// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // Password visibility toggle
  showPassword: boolean = false;
  
  // Form data
  email: string = '';
  password: string = '';

  constructor() { }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    console.log('Login attempted', { email: this.email, password: this.password });
    // Add authentication logic here
  }
}