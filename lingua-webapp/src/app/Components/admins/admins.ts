
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../side-bar/side-bar';
import { NavbarComponent } from '../nav-bar/nav-bar';
import { AdminService, Admin } from '../../Services/admin';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: './admins.html',
  styleUrls: ['./admins.css']
})
export class Admins implements OnInit, OnDestroy {
  // Data
  admins: Admin[] = [];
  filteredAdmins: Admin[] = [];
  searchTerm: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;

  // Loading state
  isLoading: boolean = false;
  error: string | null = null;

  // Modal visibility and data
  showDeactivateModal: boolean = false;
  showEditModal: boolean = false;
  showAddModal: boolean = false;
  showActivateModal: boolean = false;
  selectedAdmin: Admin | null = null;
  isProcessing: boolean = false;

  // Form data for add/edit
  editAdminData: Admin = { adminId: 0, username: '', email: '', telephone: 0, password: '', isActive: true };
  addAdminData: Admin = { adminId: 0, username: '', email: '', telephone: 0, password: '', isActive: true };


  useMockData: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Admins component initialized');


    this.subscriptions.add(
      this.adminService.loading$.subscribe(loading => {
        this.isLoading = loading;
        this.cdr.detectChanges();
      })
    );


    this.subscriptions.add(
      this.adminService.error$.subscribe(error => {
        this.error = error;
        this.cdr.detectChanges();
      })
    );


    this.subscriptions.add(
      this.adminService.admins$.subscribe(admins => {
        console.log('Admins received from service:', admins?.length);
        if (admins) {
          this.admins = admins;
          this.filterAdmins();
          this.cdr.detectChanges();
        }
      })
    );


    this.loadAdmins();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getInitials(name: string): string {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  loadAdmins(): void {
    console.log('loadAdmins called, useMockData:', this.useMockData);

    if (this.useMockData) {

      this.admins = this.getMockAdmins();
      this.filteredAdmins = [...this.admins];
      this.updatePagination();
      this.cdr.detectChanges();
      console.log('Mock data loaded:', this.admins.length);
    } else {
      this.adminService.getAllAdmins().subscribe({
        next: (admins) => {
          console.log('Admins loaded from backend:', admins?.length);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load admins:', error);

          this.useMockData = true;
          this.loadAdmins();
        }
      });
    }
  }

  private getMockAdmins(): Admin[] {
    return [
      { adminId: 1, username: 'Sarah Johnson', email: 'sarah.johnson@admin.com', telephone: 1234567890, isActive: true, password: 'hashed_1' },
      { adminId: 2, username: 'Michael Chen', email: 'michael.chen@admin.com', telephone: 1234567891, isActive: true, password: 'hashed_2' },
      { adminId: 3, username: 'Emily Rodriguez', email: 'emily.rodriguez@admin.com', telephone: 1234567892, isActive: false, password: 'hashed_3' },
      { adminId: 4, username: 'David Kim', email: 'david.kim@admin.com', telephone: 1234567893, isActive: true, password: 'hashed_4' },
      { adminId: 5, username: 'Lisa Wong', email: 'lisa.wong@admin.com', telephone: 1234567894, isActive: true, password: 'hashed_5' },
      { adminId: 6, username: 'James Wilson', email: 'james.wilson@admin.com', telephone: 1234567895, isActive: false, password: 'hashed_6' },
      { adminId: 7, username: 'Maria Garcia', email: 'maria.garcia@admin.com', telephone: 1234567896, isActive: true, password: 'hashed_7' },
      { adminId: 8, username: 'Robert Taylor', email: 'robert.taylor@admin.com', telephone: 1234567897, isActive: true, password: 'hashed_8' },
    ];
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.filterAdmins();
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  filterAdmins(): void {
    if (!this.searchTerm) {
      this.filteredAdmins = [...this.admins];
    } else {
      this.filteredAdmins = this.admins.filter(admin =>
        admin.username.toLowerCase().includes(this.searchTerm) ||
        admin.email.toLowerCase().includes(this.searchTerm) ||
        admin.telephone?.toString().includes(this.searchTerm)
      );
    }
    console.log('Filtered admins:', this.filteredAdmins.length);
    this.updatePagination();
    this.cdr.detectChanges();
  }

  // Modal handlers
  openActivateModal(admin: Admin): void {
    this.selectedAdmin = admin;
    this.showActivateModal = true;
    this.cdr.detectChanges();
  }

  openDeactivateModal(admin: Admin): void {
    this.selectedAdmin = admin;
    this.showDeactivateModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(admin: Admin): void {
    this.selectedAdmin = admin;
    this.editAdminData = { ...admin, password: '' };
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  openAddModal(): void {
    this.addAdminData = { adminId: 0, username: '', email: '', telephone: 0, password: '', isActive: true };
    this.showAddModal = true;
    this.cdr.detectChanges();
  }

  closeAllModals(): void {
    this.showDeactivateModal = false;
    this.showEditModal = false;
    this.showAddModal = false;
    this.showActivateModal = false;
    this.selectedAdmin = null;
    this.isProcessing = false;
    this.cdr.detectChanges();
  }

  // Action confirmations
  confirmActivate(): void {
    if (this.selectedAdmin && this.selectedAdmin.adminId) {
      this.isProcessing = true;
      this.cdr.detectChanges();

      if (this.useMockData) {
        setTimeout(() => {
          const admin = this.admins.find(a => a.adminId === this.selectedAdmin!.adminId);
          if (admin) {
            admin.isActive = true;
            this.filterAdmins();
          }
          this.isProcessing = false;
          this.closeAllModals();
          this.cdr.detectChanges();
        }, 500);
      } else {
        this.adminService.activateAdmin(this.selectedAdmin.adminId).subscribe({
          next: () => {
            this.closeAllModals();
            this.isProcessing = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error activating admin:', error);
            this.isProcessing = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  confirmDeactivate(): void {
    if (this.selectedAdmin && this.selectedAdmin.adminId) {
      this.isProcessing = true;
      this.cdr.detectChanges();

      if (this.useMockData) {
        setTimeout(() => {
          const admin = this.admins.find(a => a.adminId === this.selectedAdmin!.adminId);
          if (admin) {
            admin.isActive = false;
            this.filterAdmins();
          }
          this.isProcessing = false;
          this.closeAllModals();
          this.cdr.detectChanges();
        }, 500);
      } else {
        this.adminService.deactivateAdmin(this.selectedAdmin.adminId).subscribe({
          next: () => {
            this.closeAllModals();
            this.isProcessing = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error deactivating admin:', error);
            this.isProcessing = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  confirmEdit(): void {
    if (this.selectedAdmin && this.selectedAdmin.adminId &&
        this.editAdminData.username.trim() &&
        this.editAdminData.email.trim() &&
        this.editAdminData.telephone) {
      this.isProcessing = true;
      this.cdr.detectChanges();

      if (this.useMockData) {
        setTimeout(() => {
          const admin = this.admins.find(a => a.adminId === this.selectedAdmin!.adminId);
          if (admin) {
            admin.username = this.editAdminData.username;
            admin.email = this.editAdminData.email;
            admin.telephone = this.editAdminData.telephone;
            if (this.editAdminData.password && this.editAdminData.password.trim()) {
              admin.password = this.editAdminData.password;
            }
            this.filterAdmins();
          }
          this.isProcessing = false;
          this.closeAllModals();
          this.cdr.detectChanges();
        }, 500);
      } else {
        this.adminService.updateAdmin(this.selectedAdmin.adminId, this.editAdminData).subscribe({
          next: () => {
            this.closeAllModals();
            this.isProcessing = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error updating admin:', error);
            this.isProcessing = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  confirmAdd(): void {
    if (this.addAdminData.username.trim() &&
        this.addAdminData.email.trim() &&
        this.addAdminData.telephone &&
        this.addAdminData.password?.trim()) {
      this.isProcessing = true;
      this.cdr.detectChanges();

      if (this.useMockData) {
        setTimeout(() => {
          const newId = Math.max(...this.admins.map(a => a.adminId || 0), 0) + 1;
          const newAdmin: Admin = {
            adminId: newId,
            username: this.addAdminData.username,
            email: this.addAdminData.email,
            telephone: this.addAdminData.telephone,
            password: this.addAdminData.password,
            isActive: true
          };
          this.admins.push(newAdmin);
          this.filterAdmins();
          this.isProcessing = false;
          this.closeAllModals();
          this.cdr.detectChanges();
        }, 500);
      } else {
        this.adminService.addAdmin(this.addAdminData).subscribe({
          next: () => {
            this.closeAllModals();
            this.isProcessing = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error adding admin:', error);
            this.isProcessing = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  // Pagination methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAdmins.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.cdr.detectChanges();
  }

  getPaginatedAdmins(): Admin[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAdmins.slice(startIndex, endIndex);
  }

  getDisplayStart(): number {
    return this.filteredAdmins.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getDisplayEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredAdmins.length);
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

  retryLoading(): void {
    this.adminService.clearError();
    this.loadAdmins();
  }
}
