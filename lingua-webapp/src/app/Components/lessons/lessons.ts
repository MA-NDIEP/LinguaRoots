// lessons.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../side-bar/side-bar';
import { NavbarComponent } from '../nav-bar/nav-bar';

interface Lesson {
  id: number;
  type: 'alphabets' | 'numbers' | 'names' | 'syllables';
  title: string;
  character: string;
  pronunciation: string;
  example: string;
  status: 'published' | 'draft';
  lastEdited: string;
  progress?: number;
  audioUrl?: string;
  audioFile?: File;
}

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: './lessons.html',
  styleUrls: ['./lessons.css']
})
export class Lessons implements OnInit {
  // Set this to false when you have a backend ready
  useMockData: boolean = true;

  // Data properties
  lessonsList: Lesson[] = [];
  filteredLessons: Lesson[] = [];
  searchTerm: string = '';
  currentLessonType: string = 'alphabets';
  viewMode: string = 'grid';
  isLoading: boolean = false;
  error: string = '';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;
  
  // Modal states
  showLessonModal: boolean = false;
  showPreviewModal: boolean = false;
  editingLesson: Lesson | null = null;
  selectedLessonForPreview: Lesson | null = null;
  
  // Recording
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  isRecording: boolean = false;
  recordingTime: number = 0;
  recordingInterval: any;
  
  // New lesson form
  newLesson: Lesson = {
    id: 0,
    type: 'alphabets',
    title: '',
    character: '',
    pronunciation: '',
    example: '',
    status: 'draft',
    lastEdited: new Date().toISOString(),
    progress: 0
  };
  
  // Modal-specific lesson type (for the filter inside modal)
  modalLessonType: string = 'alphabets';
  
  private nextId: number = 6;

  ngOnInit(): void {
    this.loadLessons();
  }

  async loadLessons(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    
    try {
      if (this.useMockData) {
        await this.loadDemoData();
      } else {
        // When backend is ready, uncomment this:
        // this.lessonsList = await this.fetchFromBackend();
        console.log('Backend integration ready - connect your API here');
        await this.loadDemoData(); // Fallback to mock data
      }
      this.filterLessons();
    } catch (err) {
      this.error = 'Failed to load lessons. Please try again.';
      console.error('Error loading lessons:', err);
    } finally {
      this.isLoading = false;
    }
  }

  // Mock data with async delay
  async loadDemoData(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.lessonsList = [
      {
        id: 1,
        type: 'alphabets',
        title: 'Thai Alphabet: Gor Gai',
        character: 'ก',
        pronunciation: 'gaw gai',
        example: 'ไก่ (chicken)',
        status: 'published',
        lastEdited: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 78
      },
      {
        id: 2,
        type: 'numbers',
        title: 'Thai Numbers 1-10',
        character: '๑,๒,๓',
        pronunciation: 'nueng, song, sam',
        example: '1, 2, 3',
        status: 'draft',
        lastEdited: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'syllables',
        title: 'Thai Syllable Blending',
        character: 'กา → กระ',
        pronunciation: 'ka → kra',
        example: '15 combinations',
        status: 'published',
        lastEdited: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 45
      },
      {
        id: 4,
        type: 'alphabets',
        title: 'Alphabet: Khor Khwai',
        character: 'ค',
        pronunciation: 'kho khwai',
        example: 'ควาย (buffalo)',
        status: 'draft',
        lastEdited: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        type: 'names',
        title: 'Common Thai Names',
        character: 'สมชาย',
        pronunciation: 'Somchai',
        example: 'This is a common male name in Thailand',
        status: 'published',
        lastEdited: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 100
      }
    ];
    this.nextId = 6;
  }

  // Backend API methods - ready to use when you have a backend
  private async fetchFromBackend(): Promise<Lesson[]> {
    // Replace with your actual API endpoint
    const response = await fetch('http://localhost:3000/api/lessons');
    if (!response.ok) throw new Error('Failed to fetch lessons');
    return await response.json();
  }

  private async saveToBackend(lesson: Lesson): Promise<Lesson> {
    const url = lesson.id ? `http://localhost:3000/api/lessons/${lesson.id}` : 'http://localhost:3000/api/lessons';
    const method = lesson.id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lesson)
    });
    
    if (!response.ok) throw new Error('Failed to save lesson');
    return await response.json();
  }

  private async updateStatusInBackend(id: number, status: 'published' | 'draft'): Promise<void> {
    const response = await fetch(`http://localhost:3000/api/lessons/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error('Failed to update status');
  }

  filterLessons(): void {
    this.filteredLessons = this.lessonsList.filter(lesson => {
      const matchesType = lesson.type === this.currentLessonType;
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = this.searchTerm === '' || 
        lesson.title.toLowerCase().includes(searchLower) ||
        lesson.character.toLowerCase().includes(searchLower) ||
        lesson.pronunciation.toLowerCase().includes(searchLower);
      return matchesType && matchesSearch;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredLessons.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
  }

  getPaginatedLessons(): Lesson[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredLessons.slice(start, end);
  }

  getDisplayStart(): number {
    return this.filteredLessons.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  getDisplayEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredLessons.length);
  }

  getPageNumbers(): (number | -1)[] {
    const pages: (number | -1)[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    if (start > 1) pages.push(1);
    if (start > 2) pages.push(-1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < this.totalPages - 1) pages.push(-1);
    if (end < this.totalPages) pages.push(this.totalPages);
    
    return pages;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number | -1): void {
    if (page !== -1) {
      this.currentPage = page;
    }
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filterLessons();
  }

  switchLessonTab(type: string): void {
    this.currentLessonType = type;
    this.filterLessons();
  }

  setViewMode(mode: string): void {
    this.viewMode = mode;
  }

  getSectionTitle(): string {
    const titles: Record<string, string> = {
      alphabets: 'Your Alphabets Lessons',
      numbers: 'Your Numbers Lessons',
      names: 'Your Names Lessons',
      syllables: 'Your Syllables Lessons'
    };
    return titles[this.currentLessonType] || 'Your Lessons';
  }

  getLessonTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      alphabets: 'Alphabet',
      numbers: 'Numbers',
      names: 'Names',
      syllables: 'Syllables'
    };
    return type ? labels[type] || 'Lesson' : 'Lesson';
  }

  formatDate(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    
    if (days > 7) return new Date(date).toLocaleDateString();
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  getExampleLabel(): string {
    if (this.modalLessonType === 'names') {
      return 'Example Sentence *';
    } else if (this.modalLessonType === 'numbers') {
      return 'Example (Optional)';
    }
    return 'Example Word / Meaning *';
  }

  getExamplePlaceholder(): string {
    if (this.modalLessonType === 'names') {
      return 'e.g., "My name is Somchai and I am a teacher"';
    } else if (this.modalLessonType === 'numbers') {
      return 'e.g., 1, 2, 3 (optional for numbers)';
    }
    return 'e.g., "Gai" (chicken)';
  }

  isExampleRequired(): boolean {
    return this.modalLessonType !== 'numbers';
  }

  openLessonCreator(): void {
    this.editingLesson = null;
    this.modalLessonType = this.currentLessonType;
    this.newLesson = {
      id: 0,
      type: this.modalLessonType as any,
      title: '',
      character: '',
      pronunciation: '',
      example: '',
      status: 'draft',
      lastEdited: new Date().toISOString(),
      progress: 0
    };
    this.showLessonModal = true;
  }

  editLesson(lesson: Lesson): void {
    this.editingLesson = lesson;
    this.modalLessonType = lesson.type;
    this.newLesson = { ...lesson };
    this.showLessonModal = true;
  }

  closeLessonCreator(): void {
    this.showLessonModal = false;
    this.editingLesson = null;
    this.stopRecording();
  }

  switchModalLessonType(type: string): void {
    this.modalLessonType = type;
    this.newLesson.type = type as any;
    // Clear example when switching to numbers as it's optional
    if (type === 'numbers') {
      this.newLesson.example = '';
    }
  }

  async saveAsDraft(): Promise<void> {
    if (!this.validateLesson()) return;
    this.newLesson.status = 'draft';
    this.newLesson.lastEdited = new Date().toISOString();
    await this.saveLesson();
  }

  async publishLesson(): Promise<void> {
    if (!this.validateLesson()) return;
    this.newLesson.status = 'published';
    this.newLesson.lastEdited = new Date().toISOString();
    await this.saveLesson();
  }

  validateLesson(): boolean {
    if (!this.newLesson.title.trim()) {
      this.error = 'Please enter a lesson title';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    if (!this.newLesson.character.trim()) {
      this.error = 'Please enter a character/symbol';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    // Validate example based on type
    if (this.isExampleRequired() && !this.newLesson.example.trim()) {
      const fieldName = this.modalLessonType === 'names' ? 'example sentence' : 'example word';
      this.error = `Please enter an ${fieldName}`;
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    return true;
  }

  async saveLesson(): Promise<void> {
    this.isLoading = true;
    
    try {
      if (this.useMockData) {
        // Mock data save
        if (this.editingLesson) {
          const index = this.lessonsList.findIndex(l => l.id === this.editingLesson!.id);
          if (index !== -1) {
            this.lessonsList[index] = { ...this.newLesson, id: this.editingLesson.id };
          }
        } else {
          this.newLesson.id = this.nextId++;
          this.lessonsList.push({ ...this.newLesson });
        }
      } else {
        // Backend save
        const savedLesson = await this.saveToBackend(this.newLesson);
        if (this.editingLesson) {
          const index = this.lessonsList.findIndex(l => l.id === this.editingLesson!.id);
          if (index !== -1) {
            this.lessonsList[index] = savedLesson;
          }
        } else {
          this.lessonsList.push(savedLesson);
        }
      }
      
      await this.loadLessons();
      this.closeLessonCreator();
    } catch (err) {
      this.error = 'Failed to save lesson. Please try again.';
      console.error('Error saving lesson:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async toggleStatus(lesson: Lesson): Promise<void> {
    const newStatus = lesson.status === 'published' ? 'draft' : 'published';
    
    if (this.useMockData) {
      lesson.status = newStatus;
      lesson.lastEdited = new Date().toISOString();
      this.filterLessons();
    } else {
      this.isLoading = true;
      try {
        await this.updateStatusInBackend(lesson.id, newStatus);
        await this.loadLessons();
      } catch (err) {
        this.error = 'Failed to update lesson status';
        console.error('Error updating status:', err);
      } finally {
        this.isLoading = false;
      }
    }
  }

  showLessonPreview(lesson: Lesson): void {
    this.selectedLessonForPreview = { ...lesson };
    this.showPreviewModal = true;
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    this.selectedLessonForPreview = null;
  }

  editFromPreview(): void {
    if (this.selectedLessonForPreview) {
      this.closePreviewModal();
      this.editLesson(this.selectedLessonForPreview);
    }
  }

  playPronunciation(pronunciation?: string): void {
    const text = pronunciation || this.newLesson.pronunciation;
    if (text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      window.speechSynthesis.speak(utterance);
    }
  }

  playAudio(audioUrl?: string): void {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error('Error playing audio:', err));
    }
  }

  triggerAudioUpload(): void {
    const fileInput = document.querySelector('#audioFileInput') as HTMLInputElement;
    fileInput?.click();
  }

  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newLesson.audioFile = file;
      this.newLesson.audioUrl = URL.createObjectURL(file);
    }
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        this.newLesson.audioUrl = audioUrl;
        this.newLesson.audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      this.startRecordingTimer();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      this.error = 'Unable to access microphone. Please check permissions.';
      setTimeout(() => this.error = '', 3000);
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.stopRecordingTimer();
    }
  }

  startRecordingTimer(): void {
    this.recordingTime = 0;
    this.recordingInterval = setInterval(() => {
      this.recordingTime++;
    }, 1000);
  }

  stopRecordingTimer(): void {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  clearAudio(): void {
    if (this.newLesson.audioUrl) {
      URL.revokeObjectURL(this.newLesson.audioUrl);
    }
    this.newLesson.audioUrl = undefined;
    this.newLesson.audioFile = undefined;
    this.stopRecording();
  }

  formatRecordingTime(): string {
    const minutes = Math.floor(this.recordingTime / 60);
    const seconds = this.recordingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}