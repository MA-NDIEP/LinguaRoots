// admins.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../side-bar/side-bar';
import { NavbarComponent } from '../nav-bar/nav-bar';

export interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string;
  password?: string; // Optional password field
  isActive: boolean;
}

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: './admins.html',
  styleUrls: ['./admins.css']
})
export class Admins implements OnInit {
  // Configuration - Set this to false when backend is ready
  useMockData: boolean = true; // Change to false to use real backend API

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
  editAdminData: Admin = { id: 0, name: '', email: '', phone: '', password: '', isActive: true };
  addAdminData: Admin = { id: 0, name: '', email: '', phone: '', password: '', isActive: true };

  // API endpoints - Update these with your actual backend URLs
  private apiUrl = 'http://localhost:3000/api/admins'; // Example API URL

  ngOnInit(): void {
    console.log('Admins component initialized');
    console.log(`Using ${this.useMockData ? 'MOCK DATA' : 'BACKEND API'} mode`);
    this.loadAdmins();
  }

  getInitials(name: string): string {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  loadAdmins(): void {
    this.isLoading = true;
    this.error = null;
    
    if (this.useMockData) {
      this.loadMockData();
    } else {
      this.loadFromBackend();
    }
  }

  private loadMockData(): void {
    console.log('Loading mock data...');
    setTimeout(() => {
      this.admins = this.getMockAdmins();
      this.filteredAdmins = [...this.admins];
      this.updatePagination();
      this.isLoading = false;
      console.log('Mock data loaded successfully');
    }, 500);
  }

  private async loadFromBackend(): Promise<void> {
    console.log('Fetching admins from backend...');
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.admins = data;
      this.filteredAdmins = [...this.admins];
      this.updatePagination();
      console.log('Backend data loaded successfully');
    } catch (error) {
      console.error('Error loading admins from backend:', error);
      this.error = 'Failed to load admins from backend. Please check your connection.';
      // Fallback to mock data if backend fails
      if (this.useMockData === false) {
        console.log('Falling back to mock data...');
        this.loadMockData();
      }
    } finally {
      this.isLoading = false;
    }
  }

  private getMockAdmins(): Admin[] {
    return [
      { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@admin.com', phone: '+1 (555) 123-4567', password: 'hashed_password_1', isActive: true },
      { id: 2, name: 'Michael Chen', email: 'michael.chen@admin.com', phone: '+1 (555) 234-5678', password: 'hashed_password_2', isActive: true },
      { id: 3, name: 'Emily Rodriguez', email: 'emily.rodriguez@admin.com', phone: '+1 (555) 345-6789', password: 'hashed_password_3', isActive: false },
      { id: 4, name: 'David Kim', email: 'david.kim@admin.com', phone: '+1 (555) 456-7890', password: 'hashed_password_4', isActive: true },
      { id: 5, name: 'Lisa Wong', email: 'lisa.wong@admin.com', phone: '+1 (555) 567-8901', password: 'hashed_password_5', isActive: true },
      { id: 6, name: 'James Wilson', email: 'james.wilson@admin.com', phone: '+1 (555) 678-9012', password: 'hashed_password_6', isActive: false },
      { id: 7, name: 'Maria Garcia', email: 'maria.garcia@admin.com', phone: '+1 (555) 789-0123', password: 'hashed_password_7', isActive: true },
      { id: 8, name: 'Robert Taylor', email: 'robert.taylor@admin.com', phone: '+1 (555) 890-1234', password: 'hashed_password_8', isActive: true },
      { id: 9, name: 'Patricia Brown', email: 'patricia.brown@admin.com', phone: '+1 (555) 901-2345', password: 'hashed_password_9', isActive: true },
      { id: 10, name: 'Thomas Anderson', email: 'thomas.anderson@admin.com', phone: '+1 (555) 012-3456', password: 'hashed_password_10', isActive: false }
    ];
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.filterAdmins();
    this.currentPage = 1;
    this.updatePagination();
  }

  filterAdmins(): void {
    if (!this.searchTerm) {
      this.filteredAdmins = [...this.admins];
    } else {
      this.filteredAdmins = this.admins.filter(admin => 
        admin.name.toLowerCase().includes(this.searchTerm) ||
        admin.email.toLowerCase().includes(this.searchTerm) ||
        admin.phone.includes(this.searchTerm)
      );
    }
    this.updatePagination();
  }

  // Modal handlers
  openActivateModal(admin: Admin): void {
    this.selectedAdmin = admin;
    this.showActivateModal = true;
  }

  openDeactivateModal(admin: Admin): void {
    this.selectedAdmin = admin;
    this.showDeactivateModal = true;
  }

  openEditModal(admin: Admin): void {
    this.selectedAdmin = admin;
    this.editAdminData = { ...admin, password: '' }; // Clear password field on edit
    this.showEditModal = true;
  }

  openAddModal(): void {
    this.addAdminData = { id: 0, name: '', email: '', phone: '', password: '', isActive: true };
    this.showAddModal = true;
  }

  closeAllModals(): void {
    this.showDeactivateModal = false;
    this.showEditModal = false;
    this.showAddModal = false;
    this.showActivateModal = false;
    this.selectedAdmin = null;
    this.isProcessing = false;
  }

  // Action confirmations
  confirmActivate(): void {
    if (this.selectedAdmin) {
      this.isProcessing = true;
      
      if (this.useMockData) {
        setTimeout(() => {
          const admin = this.admins.find(a => a.id === this.selectedAdmin!.id);
          if (admin) {
            admin.isActive = true;
          }
          this.filterAdmins();
          this.isProcessing = false;
          this.closeAllModals();
        }, 500);
      } else {
        this.activateAdminInBackend(this.selectedAdmin);
      }
    }
  }

  confirmDeactivate(): void {
    if (this.selectedAdmin) {
      this.isProcessing = true;
      
      if (this.useMockData) {
        setTimeout(() => {
          const admin = this.admins.find(a => a.id === this.selectedAdmin!.id);
          if (admin) {
            admin.isActive = false;
          }
          this.filterAdmins();
          this.isProcessing = false;
          this.closeAllModals();
        }, 500);
      } else {
        this.deactivateAdminInBackend(this.selectedAdmin);
      }
    }
  }

  confirmEdit(): void {
    if (this.selectedAdmin && this.editAdminData.name.trim() && this.editAdminData.email.trim() && this.editAdminData.phone.trim()) {
      this.isProcessing = true;
      
      if (this.useMockData) {
        setTimeout(() => {
          const admin = this.admins.find(a => a.id === this.selectedAdmin!.id);
          if (admin) {
            admin.name = this.editAdminData.name;
            admin.email = this.editAdminData.email;
            admin.phone = this.editAdminData.phone;
            // Only update password if a new one was provided
            if (this.editAdminData.password && this.editAdminData.password.trim()) {
              admin.password = this.editAdminData.password;
            }
          }
          this.filterAdmins();
          this.isProcessing = false;
          this.closeAllModals();
        }, 500);
      } else {
        this.updateAdminInBackend(this.selectedAdmin.id, this.editAdminData);
      }
    }
  }

  confirmAdd(): void {
    if (this.addAdminData.name.trim() && this.addAdminData.email.trim() && this.addAdminData.phone.trim() && this.addAdminData.password?.trim()) {
      this.isProcessing = true;
      
      if (this.useMockData) {
        setTimeout(() => {
          const newId = Math.max(...this.admins.map(a => a.id), 0) + 1;
          const newAdmin: Admin = {
            id: newId,
            name: this.addAdminData.name,
            email: this.addAdminData.email,
            phone: this.addAdminData.phone,
            password: this.addAdminData.password,
            isActive: true
          };
          this.admins.push(newAdmin);
          this.filterAdmins();
          this.isProcessing = false;
          this.closeAllModals();
        }, 500);
      } else {
        this.createAdminInBackend(this.addAdminData);
      }
    }
  }

  // Backend API methods - Implement these based on your actual backend
  private async activateAdminInBackend(admin: Admin): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${admin.id}/activate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: true })
      });
      
      if (!response.ok) throw new Error('Failed to activate admin');
      
      const updatedAdmin = await response.json();
      const index = this.admins.findIndex(a => a.id === admin.id);
      if (index !== -1) {
        this.admins[index] = updatedAdmin;
      }
      this.filterAdmins();
      this.closeAllModals();
    } catch (error) {
      console.error('Error activating admin:', error);
      this.error = 'Failed to activate admin. Please try again.';
    } finally {
      this.isProcessing = false;
    }
  }

  private async deactivateAdminInBackend(admin: Admin): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${admin.id}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false })
      });
      
      if (!response.ok) throw new Error('Failed to deactivate admin');
      
      const updatedAdmin = await response.json();
      const index = this.admins.findIndex(a => a.id === admin.id);
      if (index !== -1) {
        this.admins[index] = updatedAdmin;
      }
      this.filterAdmins();
      this.closeAllModals();
    } catch (error) {
      console.error('Error deactivating admin:', error);
      this.error = 'Failed to deactivate admin. Please try again.';
    } finally {
      this.isProcessing = false;
    }
  }

  private async updateAdminInBackend(id: number, adminData: Admin): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData)
      });
      
      if (!response.ok) throw new Error('Failed to update admin');
      
      const updatedAdmin = await response.json();
      const index = this.admins.findIndex(a => a.id === id);
      if (index !== -1) {
        this.admins[index] = updatedAdmin;
      }
      this.filterAdmins();
      this.closeAllModals();
    } catch (error) {
      console.error('Error updating admin:', error);
      this.error = 'Failed to update admin. Please try again.';
    } finally {
      this.isProcessing = false;
    }
  }

  private async createAdminInBackend(adminData: Admin): Promise<void> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData)
      });
      
      if (!response.ok) throw new Error('Failed to create admin');
      
      const newAdmin = await response.json();
      this.admins.push(newAdmin);
      this.filterAdmins();
      this.closeAllModals();
    } catch (error) {
      console.error('Error creating admin:', error);
      this.error = 'Failed to create admin. Please try again.';
    } finally {
      this.isProcessing = false;
    }
  }

  // Pagination methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAdmins.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
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
    }
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