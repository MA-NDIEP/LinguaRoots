// navbar.component.ts - Ultra Simple Version
import {Component, HostListener, OnInit} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.css']
})
export class NavbarComponent implements OnInit {
  pageTitle: string = '';
  userName: string = 'Guest'; // Default fallback
  userInitial: string = 'G';
  isDropdownOpen: boolean = false;

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

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  goToProfile() {
    this.isDropdownOpen = false;
    this.router.navigate(['/profile']);
  }

  logout() {
    this.isDropdownOpen = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar-user')) {
      this.isDropdownOpen = false;
    }
  }
}
