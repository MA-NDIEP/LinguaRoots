import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Tab {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.css'],
  imports: [CommonModule] 
})
export class SidebarComponent implements OnInit {
  tabs: Tab[] = [
    { id: 'dashboard', label: 'DASHBOARD', icon: 'fas fa-chart-line', route: '/dashboard' },
    { id: 'students', label: 'STUDENTS', icon: 'fas fa-users', route: '/student' },
    { id: 'admins', label: 'ADMINS', icon: 'fas fa-user-shield', route: '/admins' },
    { id: 'dictionary', label: 'DICTIONARY', icon: 'fas fa-book', route: '/dictionary' },
    { id: 'lessons', label: 'LESSONS', icon: 'fas fa-chalkboard-teacher', route: '/lesson' },
    { id: 'post', label: 'POST', icon: 'fas fa-paper-plane', route: '/posts' }
  ];

  activeTab: string = 'students'; // Default to students since that's your current page
  bottomImageUrl: string = '/Ayuk1.png';
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Set active tab based on current URL
    this.updateActiveTabFromUrl(this.router.url);
    
    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveTabFromUrl(event.url);
    });
  }

  updateActiveTabFromUrl(url: string): void {
    const matchingTab = this.tabs.find(tab => url.includes(tab.route));
    
    if (matchingTab) {
      this.activeTab = matchingTab.id;
    } else {
      // If no match, try to find by exact path
      const exactMatch = this.tabs.find(tab => url === tab.route || url.startsWith(tab.route + '/'));
      if (exactMatch) {
        this.activeTab = exactMatch.id;
      } else {
        this.activeTab = 'dashboard'; // fallback
      }
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      this.router.navigate([tab.route]);
    }
  }
}