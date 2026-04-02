
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../side-bar/side-bar';
import { NavbarComponent } from '../nav-bar/nav-bar';
import { Lesson, LessonService } from '../../Services/lesson';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: './lessons.html',
  styleUrls: ['./lessons.css']
})
export class Lessons implements OnInit, OnDestroy {
  useMockData: boolean = true;

  lessonsList: Lesson[] = [];
  filteredLessons: Lesson[] = [];
  searchTerm: string = '';
  currentLessonType: string = 'alphabets';
  viewMode: string = 'grid';
  isLoading: boolean = false;
  error: string = '';
  
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;
  
  showLessonModal: boolean = false;
  showPreviewModal: boolean = false;
  editingLesson: Lesson | null = null;
  selectedLessonForPreview: Lesson | null = null;
  
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  isRecording: boolean = false;
  recordingTime: number = 0;
  recordingInterval: any;
  
  newLesson: Lesson = {
    type: 'alphabets',
    title: '',
    content: '',
    writtenPronunciation: '',
    example: '',
    englishEquivalent: '',
    status: 'published'
  };
  
  modalLessonType: string = 'alphabets';
  
  private nextId: number = 6;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private lessonService: LessonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Lessons component initialized');
    

    this.subscriptions.add(
      this.lessonService.loading$.subscribe(loading => {
        this.isLoading = loading;
        this.cdr.detectChanges();
      })
    );
    

    this.subscriptions.add(
      this.lessonService.error$.subscribe(error => {
        this.error = error || '';
        this.cdr.detectChanges();
      })
    );
    
    
    this.subscriptions.add(
      this.lessonService.lessons$.subscribe(lessons => {
        console.log('Lessons received from service:', lessons?.length);
        if (lessons) {
          this.lessonsList = lessons;
          this.filterLessons();
          this.cdr.detectChanges();
        }
      })
    );
    
    
    this.loadLessons();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async loadLessons(): Promise<void> {
    console.log('loadLessons called, useMockData:', this.useMockData);
    
    if (this.useMockData) {
      await this.loadDemoData();
      this.filterLessons();
      this.cdr.detectChanges();
    } else {
      this.lessonService.getAllLessons().subscribe({
        next: (lessons) => {
          console.log('Lessons loaded from backend:', lessons?.length);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load lessons:', error);
          this.useMockData = true;
          this.loadLessons();
        }
      });
    }
  }

  async loadDemoData(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.lessonsList = [
      {
        lessonId: 1,
        type: 'alphabets',
        title: 'Thai Alphabet: Gor Gai',
        content: 'ก',
        writtenPronunciation: 'gaw gai',
        example: 'ไก่ (chicken)',
        englishEquivalent: 'Gor Gai - Chicken',
        status: 'published'
      },
      {
        lessonId: 2,
        type: 'numbers',
        title: 'Thai Numbers 1-10',
        content: '๑,๒,๓',
        writtenPronunciation: 'nueng, song, sam',
        example: '1, 2, 3',
        englishEquivalent: 'One, Two, Three',
        status: 'published'
      },
      {
        lessonId: 3,
        type: 'syllables',
        title: 'Thai Syllable Blending',
        content: 'กา → กระ',
        writtenPronunciation: 'ka → kra',
        example: '15 combinations',
        englishEquivalent: 'Syllable blending practice',
        status: 'published'
      },
      {
        lessonId: 4,
        type: 'alphabets',
        title: 'Alphabet: Khor Khwai',
        content: 'ค',
        writtenPronunciation: 'kho khwai',
        example: 'ควาย (buffalo)',
        englishEquivalent: 'Khor Khwai - Buffalo',
        status: 'published'
      },
      {
        lessonId: 5,
        type: 'names',
        title: 'Common Thai Names',
        content: 'สมชาย',
        writtenPronunciation: 'Somchai',
        example: 'This is a common male name in Thailand',
        englishEquivalent: 'Somchai (common male name)',
        status: 'published'
      }
    ];
    this.nextId = 6;
  }

  filterLessons(): void {
    this.filteredLessons = this.lessonsList.filter(lesson => {
      const matchesType = lesson.type === this.currentLessonType;
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = this.searchTerm === '' || 
        lesson.title.toLowerCase().includes(searchLower) ||
        lesson.content.toLowerCase().includes(searchLower) ||
        lesson.writtenPronunciation.toLowerCase().includes(searchLower) ||
        lesson.englishEquivalent.toLowerCase().includes(searchLower);
      return matchesType && matchesSearch;
    });
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredLessons.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
    this.cdr.detectChanges();
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
      this.cdr.detectChanges();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  goToPage(page: number | -1): void {
    if (page !== -1) {
      this.currentPage = page;
      this.cdr.detectChanges();
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
    this.cdr.detectChanges();
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
      type: this.modalLessonType as any,
      title: '',
      content: '',
      writtenPronunciation: '',
      example: '',
      englishEquivalent: '',
      status: 'published'
    };
    this.showLessonModal = true;
    this.cdr.detectChanges();
  }

  editLesson(lesson: Lesson): void {
    this.editingLesson = lesson;
    this.modalLessonType = lesson.type;
    this.newLesson = { ...lesson };
    this.showLessonModal = true;
    this.cdr.detectChanges();
  }

  closeLessonCreator(): void {
    this.showLessonModal = false;
    this.editingLesson = null;
    this.stopRecording();
    this.cdr.detectChanges();
  }

  switchModalLessonType(type: string): void {
    this.modalLessonType = type;
    this.newLesson.type = type as any;
    if (type === 'numbers') {
      this.newLesson.example = '';
    }
    this.cdr.detectChanges();
  }

  async publishLesson(): Promise<void> {
    if (!this.validateLesson()) return;
    this.newLesson.status = 'published';
    await this.saveLesson();
  }

  validateLesson(): boolean {
    if (!this.newLesson.title.trim()) {
      this.error = 'Please enter a lesson title';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    if (!this.newLesson.content.trim()) {
      this.error = 'Please enter content/character/symbol';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    if (!this.newLesson.englishEquivalent.trim()) {
      this.error = 'Please enter English equivalent';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
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
    this.cdr.detectChanges();
    
    try {
      if (this.useMockData) {
        if (this.editingLesson) {
          const index = this.lessonsList.findIndex(l => l.lessonId === this.editingLesson!.lessonId);
          if (index !== -1) {
            this.lessonsList[index] = { ...this.newLesson, lessonId: this.editingLesson.lessonId };
          }
        } else {
          this.newLesson.lessonId = this.nextId++;
          this.lessonsList.push({ ...this.newLesson });
        }
      } else {
        if (this.editingLesson) {
          await this.lessonService.updateLesson(
            this.editingLesson.lessonId!, 
            this.newLesson, 
            this.newLesson.pronunciation
          ).toPromise();
        } else {
          await this.lessonService.addLesson(this.newLesson, this.newLesson.pronunciation).toPromise();
        }
      }
      
      await this.loadLessons();
      this.closeLessonCreator();
    } catch (err) {
      this.error = 'Failed to save lesson. Please try again.';
      console.error('Error saving lesson:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async toggleStatus(lesson: Lesson): Promise<void> {
    const newStatus = lesson.status === 'published' ? 'draft' : 'published';
    
    if (this.useMockData) {
      lesson.status = newStatus;
      this.filterLessons();
      this.cdr.detectChanges();
    } else {
      this.isLoading = true;
      this.cdr.detectChanges();
      try {
        await this.lessonService.toggleLessonStatus(lesson.lessonId!, newStatus).toPromise();
        await this.loadLessons();
      } catch (err) {
        this.error = 'Failed to update lesson status';
        console.error('Error updating status:', err);
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }
  }

  showLessonPreview(lesson: Lesson): void {
    this.selectedLessonForPreview = { ...lesson };
    this.showPreviewModal = true;
    this.cdr.detectChanges();
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    this.selectedLessonForPreview = null;
    this.cdr.detectChanges();
  }

  editFromPreview(): void {
    if (this.selectedLessonForPreview) {
      this.closePreviewModal();
      this.editLesson(this.selectedLessonForPreview);
    }
  }

  playWrittenPronunciation(pronunciation?: string): void {
    const text = pronunciation || this.newLesson.writtenPronunciation;
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
      this.newLesson.pronunciation = file;
      this.newLesson.audioUrl = URL.createObjectURL(file);
      this.cdr.detectChanges();
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
        this.newLesson.pronunciation = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        this.cdr.detectChanges();
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      this.startRecordingTimer();
      this.cdr.detectChanges();
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
      this.cdr.detectChanges();
    }
  }

  startRecordingTimer(): void {
    this.recordingTime = 0;
    this.recordingInterval = setInterval(() => {
      this.recordingTime++;
      this.cdr.detectChanges();
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
    this.newLesson.pronunciation = undefined;
    this.stopRecording();
    this.cdr.detectChanges();
  }

  formatRecordingTime(): string {
    const minutes = Math.floor(this.recordingTime / 60);
    const seconds = this.recordingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  retryLoading(): void {
    this.lessonService.clearError();
    this.loadLessons();
  }
}