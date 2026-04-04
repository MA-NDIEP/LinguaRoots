import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../nav-bar/nav-bar';
import { SidebarComponent } from '../side-bar/side-bar';
import { StudentService, Student } from '../../Services/student';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  templateUrl: './student.html',
  styleUrls: ['./student.css']
})
export class StudentComponent implements OnInit, OnDestroy {
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


  useMockData: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private studentService: StudentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Component initialized - loading students');


    this.subscriptions.add(
      this.studentService.loading$.subscribe(loading => {
        this.isLoading = loading;
        this.cdr.detectChanges();
      })
    );


    this.subscriptions.add(
      this.studentService.error$.subscribe(error => {
        this.error = error;
        this.cdr.detectChanges();
      })
    );


    this.subscriptions.add(
      this.studentService.students$.subscribe(students => {
        console.log('Students received from service:', students?.length);
        if (students) {
          this.students = students;
          this.filterStudents();
          this.cdr.detectChanges();
        }
      })
    );


    this.loadStudents();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
      this.cdr.detectChanges();
    }
  }

  loadStudents(): void {
    console.log('loadStudents called, useMockData:', this.useMockData);

    if (this.useMockData) {

      this.students = this.getMockStudents();
      this.filteredStudents = [...this.students];
      this.updatePagination();
      this.cdr.detectChanges();
      console.log('Mock data loaded:', this.students.length);
    } else {
      this.studentService.getAllStudents().subscribe({
        next: (students) => {
          console.log('Students loaded from backend:', students?.length);

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load students:', error);

          this.useMockData = true;
          this.loadStudents();
        }
      });
    }
  }

  private getMockStudents(): Student[] {
    return [
      { id: 1, username: 'Olivia Green', email: 'olivia.green@example.edu', isActive: true },
      { id: 2, username: 'Ethan Chen', email: 'e.chen@student.college', isActive: true },
      { id: 3, username: 'Maya Rodriguez', email: 'maya.rodriguez@univ.edu', isActive: true },
      { id: 4, username: 'James Carter', email: 'jcarter@academic.net', isActive: true },
      { id: 5, username: 'Zara Ahmed', email: 'z.ahmed@science.inst', isActive: true },
      { id: 6, username: 'Liam O\'Sullivan', email: 'liam.os@iresearch.org', isActive: true },
      { id: 7, username: 'Sophia Kim', email: 'sophia.k@designlab.edu', isActive: true },
      { id: 8, username: 'Noah Williams', email: 'n.williams@business.co', isActive: true },
    ];
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.filterStudents();
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  filterStudents(): void {
    if (!this.searchTerm) {
      this.filteredStudents = [...this.students];
    } else {
      this.filteredStudents = this.students.filter(student =>
        student.username.toLowerCase().includes(this.searchTerm) ||
        student.email.toLowerCase().includes(this.searchTerm)
      );
    }
    console.log('Filtered students:', this.filteredStudents.length);
    this.updatePagination();
    this.cdr.detectChanges();
  }

  // Open modal for deactivation confirmation
  openDeactivateModal(student: Student): void {
    this.selectedStudent = student;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  // Close modal
  closeModal(): void {
    this.showModal = false;
    this.selectedStudent = null;
    this.cdr.detectChanges();
  }

  // Confirm deactivation
  confirmDeactivate(): void {
    if (this.selectedStudent && this.selectedStudent.id) {
      this.isDeactivating = true;
      this.cdr.detectChanges();

      if (this.useMockData) {

        setTimeout(() => {
          if (this.selectedStudent) {
            const index = this.students.findIndex(s => s.id === this.selectedStudent!.id);
            if (index !== -1) {
              this.students[index].isActive = false;
              this.filterStudents();
            }
          }
          this.isDeactivating = false;
          this.closeModal();
          this.cdr.detectChanges();
        }, 500);
      } else {
        this.studentService.deactivateStudent(this.selectedStudent.id).subscribe({
          next: () => {

            this.closeModal();
            this.isDeactivating = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error deactivating student:', error);
            this.isDeactivating = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  // Deactivate student (called from modal or directly)
  deactivateStudent(student: Student): void {
    this.openDeactivateModal(student);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.cdr.detectChanges();
  }

  getPaginatedStudents(): Student[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginated = this.filteredStudents.slice(startIndex, endIndex);
    return paginated;
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
      this.cdr.detectChanges();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  // Retry loading if error occurred
  retryLoading(): void {
    this.studentService.clearError();
    this.loadStudents();
  }
}
