// student.component.ts - Updated with modal functionality
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../nav-bar/nav-bar';
import { SidebarComponent } from '../side-bar/side-bar';

export interface Student {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  templateUrl: './student.html',
  styleUrls: ['./student.css']
})
export class StudentComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  searchTerm: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  
  // Loading state
  isLoading: boolean = false;
  error: string | null = null;
  
  // Modal properties
  showModal: boolean = false;
  selectedStudent: Student | null = null;
  isDeactivating: boolean = false;
  
  // Flag to use mock data
  useMockData: boolean = true;

  ngOnInit(): void {
    this.loadStudents();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1);
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page !== -1 && page !== this.currentPage) {
      this.currentPage = page;
    }
  }

  loadStudents(): void {
    if (this.useMockData) {
      this.students = this.getMockStudents();
      this.filteredStudents = [...this.students];
      this.updatePagination();
    } else {
      this.fetchStudentsFromBackend();
    }
  }

  private getMockStudents(): Student[] {
    return [
      { id: 1, name: 'Olivia Green', email: 'olivia.green@example.edu', isActive: true },
      { id: 2, name: 'Ethan Chen', email: 'e.chen@student.college',  isActive: true },
      { id: 3, name: 'Maya Rodriguez', email: 'maya.rodriguez@univ.edu',  isActive: true },
      { id: 4, name: 'James Carter', email: 'jcarter@academic.net',  isActive: true },
      { id: 5, name: 'Zara Ahmed', email: 'z.ahmed@science.inst',  isActive: true },
      { id: 6, name: 'Liam O\'Sullivan', email: 'liam.os@iresearch.org',  isActive: true },
      { id: 7, name: 'Sophia Kim', email: 'sophia.k@designlab.edu',  isActive: true },
      { id: 8, name: 'Noah Williams', email: 'n.williams@business.co',  isActive: true },
      { id: 9, name: 'Isabella Rossi', email: 'i.rossi@europe.uni',  isActive: true },
      { id: 10, name: 'Lucas Park', email: 'l.park@techschool.edu',  isActive: true },
      { id: 11, name: 'Amélie Dubois', email: 'amelie.d@polytech.fr',  isActive: true },
      { id: 12, name: 'Oliver Brown', email: 'oliver.brown@uni-uk.ac',  isActive: true },
      { id: 13, name: 'Charlotte Jensen', email: 'c.jensen@nordic.inst',  isActive: true },
      { id: 14, name: 'Benjamin Kumar', email: 'ben.kumar@global.edu',  isActive: true },
      { id: 15, name: 'Elena Petrova', email: 'e.petrova@east.uni',  isActive: true },
      { id: 16, name: 'Mohamed Al-Farsi', email: 'm.alfarsi@midast.tech',  isActive: true },
      { id: 17, name: 'Grace Zhang', email: 'grace.zhang@asianscholar.edu',  isActive: true },
      { id: 18, name: 'Samuel Johansson', email: 'sam.j@nordicscience.se',  isActive: true },
      { id: 19, name: 'Aisha Khan', email: 'a.khan@communitycollege.ca',  isActive: true },
      { id: 20, name: 'Hugo Silva', email: 'hugo.s@iberian.pt',  isActive: true },
      { id: 21, name: 'Clara Müller', email: 'c.mueller@tech.berlin',  isActive: true },
      { id: 22, name: 'David Cohen', email: 'd.cohen@research.il',  isActive: true },
      { id: 23, name: 'Nina Kovalenko', email: 'n.kovalenko@cs.ua',  isActive: true },
      { id: 24, name: 'Fatima El-Sayed', email: 'f.elsayed@nile.ac',  isActive: true },
      { id: 25, name: 'Tomás Herrera', email: 't.herrera@latam.univ',  isActive: true },
      { id: 26, name: 'Yuki Tanaka', email: 'y.tanaka@jp-tech.jp',  isActive: true },
      { id: 27, name: 'Leah Silverman', email: 'leah.silverman@nyu.edu',  isActive: true },
      { id: 28, name: 'Daniel Adefope', email: 'd.adefope@african.uni',  isActive: true }
    ];
  }

  private async fetchStudentsFromBackend(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    
    try {
      throw new Error('Backend not ready - using mock data');
    } catch (error) {
      console.error('Error fetching students:', error);
      this.error = 'Failed to load students. Using mock data.';
      this.students = this.getMockStudents();
      this.filteredStudents = [...this.students];
      this.updatePagination();
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.filterStudents();
    this.currentPage = 1;
    this.updatePagination();
  }

  filterStudents(): void {
    if (!this.searchTerm) {
      this.filteredStudents = [...this.students];
    } else {
      this.filteredStudents = this.students.filter(student => 
        student.name.toLowerCase().includes(this.searchTerm) ||
        student.email.toLowerCase().includes(this.searchTerm)
      );
    }
    this.updatePagination();
  }

  // Open modal for deactivation confirmation
  openDeactivateModal(student: Student): void {
    this.selectedStudent = student;
    this.showModal = true;
  }

  // Close modal
  closeModal(): void {
    this.showModal = false;
    this.selectedStudent = null;
  }

  // Confirm deactivation
  confirmDeactivate(): void {
    if (this.selectedStudent) {
      this.isDeactivating = true;
      
      if (this.useMockData) {
        // Simulate async operation
        setTimeout(() => {
          this.selectedStudent!.isActive = false;
          this.filterStudents();
          this.isDeactivating = false;
          this.closeModal();
        }, 500);
      } else {
        this.deactivateStudentInBackend(this.selectedStudent);
      }
    }
  }

  // Deactivate student (called from modal or directly)
  deactivateStudent(student: Student): void {
    this.openDeactivateModal(student);
  }

  private async deactivateStudentInBackend(student: Student): Promise<void> {
    this.isLoading = true;
    try {
      console.log(`Deactivating student: ${student.name}`);
      student.isActive = false;
      this.filterStudents();
      this.closeModal();
    } catch (error) {
      console.error('Error deactivating student:', error);
      this.error = 'Failed to deactivate student. Please try again.';
    } finally {
      this.isLoading = false;
      this.isDeactivating = false;
    }
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  getPaginatedStudents(): Student[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredStudents.slice(startIndex, endIndex);
  }

  getDisplayStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getDisplayEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredStudents.length);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}