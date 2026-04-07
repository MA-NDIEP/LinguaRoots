
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {OnInit} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.css']
})
export class NavbarComponent implements OnInit {
  pageTitle: string = '';
  userName: string = 'John Doe';
  userEmail: string = 'john.doe@example.com';
  userInitial: string = 'J';
  isDropdownOpen: boolean = false;


  showProfileModal: boolean = false;
  isUpdating: boolean = false;
  profileSuccessMessage: string = '';
  profileErrorMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  profileData = {
    username: 'John Doe',
    email: 'john.doe@example.com',
    password: '',
    confirmPassword: ''
  };

  constructor(private router: Router) {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updatePageTitle(event.url);
      }
    });
  }

  ngOnInit(): void {
    // 1. Fetch the username from localStorage
    const storedName = localStorage.getItem('username');

    if (storedName) {
      this.userName = storedName;
      // 2. Set the initial (first letter, uppercase)
      this.userInitial = storedName.charAt(0).toUpperCase();
    }
  }

  private updatePageTitle(url: string): void {
    if (url.includes('student')) {
      this.pageTitle = 'Student Management';
    } else if (url.includes('admins')) {
      this.pageTitle = 'Admin Management';
    } else if (url.includes('lesson')) {
      this.pageTitle = 'Lesson Management';
    } else if (url.includes('posts')) {
      this.pageTitle = 'Post Management';
    } else if (url.includes('dictionary')) {
      this.pageTitle = 'Dictionary';
    } else {
      this.pageTitle = 'Dashboard';
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  goToProfile() {
    this.isDropdownOpen = false;
    this.loadUserData();
    this.showProfileModal = true;
  }

  loadUserData() {

    this.profileData = {
      username: this.userName,
      email: this.userEmail,
      password: '',
      confirmPassword: ''
    };

    this.profileSuccessMessage = '';
    this.profileErrorMessage = '';
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.profileData = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.profileSuccessMessage = '';
    this.profileErrorMessage = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  updateProfile() {

    this.profileSuccessMessage = '';
    this.profileErrorMessage = '';


    if (!this.profileData.username || !this.profileData.email) {
      this.profileErrorMessage = 'Username and email are required';
      return;
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.profileData.email)) {
      this.profileErrorMessage = 'Please enter a valid email address';
      return;
    }


    if (this.profileData.password || this.profileData.confirmPassword) {
      if (this.profileData.password.length < 6) {
        this.profileErrorMessage = 'Password must be at least 6 characters long';
        return;
      }

      if (this.profileData.password !== this.profileData.confirmPassword) {
        this.profileErrorMessage = 'Passwords do not match';
        return;
      }
    }

    this.isUpdating = true;


    setTimeout(() => {
      try {

        this.userName = this.profileData.username;
        this.userEmail = this.profileData.email;
        this.userInitial = this.profileData.username.charAt(0).toUpperCase();
        this.profileSuccessMessage = 'Profile updated successfully!';


        this.profileData.password = '';
        this.profileData.confirmPassword = '';


        setTimeout(() => {
          this.closeProfileModal();
        }, 2000);

      } catch (error) {
        this.profileErrorMessage = 'Failed to update profile. Please try again.';
      } finally {
        this.isUpdating = false;
      }
    }, 1500);
  }

  logout() {
    this.isDropdownOpen = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isClickInside = target.closest('.navbar-user');

    if (!isClickInside && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }
}
