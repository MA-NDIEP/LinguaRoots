
import {ChangeDetectorRef, Component, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {OnInit} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import {AdminService} from '../../Services/admin';

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
  userId: number = 0;
  userEmail: string = 'john.doe@example.com';
  userInitial: string = 'J';
  isDropdownOpen: boolean = false;
  currentUserEmail: string = '';


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

  constructor(private router: Router, private adminService: AdminService, private cdr: ChangeDetectorRef) {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updatePageTitle(event.url);
      }
    });
  }

  ngOnInit(): void {
    const storedName = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    if (storedName) {
      this.userName = storedName;
      this.userId = userId ? parseInt(userId) : 0;
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

    this.adminService.getAdmin(this.userId).subscribe({
      next: (admin) => {
        this.profileData = {
          username: admin.username,
          email: admin.email,
          password: '',
          confirmPassword: ''
        };
        this.currentUserEmail = admin.email;
        this.isUpdating = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error adding admin:', error);
        this.isUpdating = false;
        this.cdr.detectChanges();
      }
    });

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

    const hasPasswordInput = !!(this.profileData.password?.trim() || this.profileData.confirmPassword?.trim());

    if (hasPasswordInput) {
      if (!this.profileData.password || this.profileData.password.length < 6) {
        this.profileErrorMessage = 'Password must be at least 6 characters long';
        return;
      }

      if (this.profileData.password !== this.profileData.confirmPassword) {
        this.profileErrorMessage = 'Passwords do not match';
        return;
      }
    }

    const isEmailChanged = this.profileData.email.trim().toLowerCase() !== this.currentUserEmail.trim().toLowerCase();

    this.isUpdating = true;

    const payload = {
      ...this.profileData,
      password: hasPasswordInput ? this.profileData.password : null,
      confirmPassword: hasPasswordInput ? this.profileData.confirmPassword : null
    };

    this.adminService.updateAdmin(this.userId, payload as any).subscribe({
      next: () => {
        this.userInitial = this.profileData.username.charAt(0).toUpperCase();
        this.userName = this.profileData.username;

        const shouldLogout = isEmailChanged;

        this.profileData.password = '';
        this.profileData.confirmPassword = '';
        this.isUpdating = false;
        this.profileSuccessMessage = 'Profile updated successfully!';
        this.cdr.detectChanges();

        if (shouldLogout) {
          this.profileSuccessMessage = isEmailChanged
            ? 'Email updated! Logging out for security...'
            : 'Password updated! Logging out...';
          this.cdr.detectChanges();

          setTimeout(() => {
            this.logout();
          }, 1500);
        } else {
          setTimeout(() => {
            this.closeProfileModal();
            this.cdr.detectChanges();
          }, 1500);
        }
      },
      error: (error) => {
        console.error('Error updating admin:', error);
        this.profileErrorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        this.isUpdating = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.isDropdownOpen = false;
    this.router.navigate(['']);
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
