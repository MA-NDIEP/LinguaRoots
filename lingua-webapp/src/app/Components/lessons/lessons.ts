import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
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
  useMockData: boolean = false;

  lessonsList: Lesson[] = [];
  filteredLessons: Lesson[] = [];
  searchTerm: string = '';
  currentLessonType: string = 'ALPHABET';
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
  recordedBlob: Blob | null = null;

  newLesson: Lesson = {
    type: 'ALPHABET',
    title: '',
    content: '',
    writtenPronunciation: '',
    example: '',
    englishEquivalent: '',
    status: 'PUBLISHED',
    lessonOrder: 1
  };

  modalLessonType: string = 'ALPHABET';
  private nextId: number = 6;
  private subscriptions: Subscription = new Subscription();
  private currentAudio: HTMLAudioElement | null = null;

  @ViewChild('audioFileInput') audioFileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private lessonService: LessonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  async loadLessons(): Promise<void> {
    if (this.useMockData) {
      await this.loadDemoData();
      this.filterLessons();
      this.cdr.detectChanges();
    } else {
      this.lessonService.getAllLessons().subscribe({
        next: (lessons) => {
          if (lessons) {
            this.lessonsList = lessons;
            this.filterLessons();
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load lessons:', error);
          this.useMockData = true;
          this.loadLessons();
          this.cdr.detectChanges();
        }
      });
    }
  }

  async loadDemoData(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.lessonsList = [
      {
        lessonId: 1,
        type: 'ALPHABET',
        title: 'Thai Alphabet: Gor Gai',
        content: 'ก',
        writtenPronunciation: 'gaw gai',
        example: 'ไก่ (chicken)',
        englishEquivalent: 'Gor Gai - Chicken',
        status: 'PUBLISHED',
        lessonOrder: 1
      },
      {
        lessonId: 2,
        type: 'NUMBER',
        title: 'Thai Numbers 1-10',
        content: '๑,๒,๓',
        writtenPronunciation: 'nueng, song, sam',
        example: '1, 2, 3',
        englishEquivalent: 'One, Two, Three',
        status: 'PUBLISHED',
        lessonOrder: 1
      },
      {
        lessonId: 3,
        type: 'SYLLABLE',
        title: 'Thai Syllable Blending',
        content: 'กา → กระ',
        writtenPronunciation: 'ka → kra',
        example: '15 combinations',
        englishEquivalent: 'Syllable blending practice',
        status: 'PUBLISHED',
        lessonOrder: 1
      },
      {
        lessonId: 4,
        type: 'ALPHABET',
        title: 'Alphabet: Khor Khwai',
        content: 'ค',
        writtenPronunciation: 'kho khwai',
        example: 'ควาย (buffalo)',
        englishEquivalent: 'Khor Khwai - Buffalo',
        status: 'PUBLISHED',
        lessonOrder: 2
      },
      {
        lessonId: 5,
        type: 'NAME',
        title: 'Common Thai Names',
        content: 'สมชาย',
        writtenPronunciation: 'Somchai',
        example: 'This is a common male name in Thailand',
        englishEquivalent: 'Somchai (common male name)',
        status: 'PUBLISHED',
        lessonOrder: 1
      }
    ];
    this.nextId = 6;
  }

  filterLessons(): void {
    this.filteredLessons = this.lessonsList
      .filter(lesson => {
        const matchesType = lesson.type === this.currentLessonType;
        const searchLower = this.searchTerm.toLowerCase();
        const matchesSearch = this.searchTerm === '' ||
          lesson.title.toLowerCase().includes(searchLower) ||
          lesson.content.toLowerCase().includes(searchLower) ||
          (lesson.writtenPronunciation && lesson.writtenPronunciation.toLowerCase().includes(searchLower)) ||
          lesson.englishEquivalent.toLowerCase().includes(searchLower);
        return matchesType && matchesSearch;
      })
      .sort((a, b) => (a.lessonOrder || 999) - (b.lessonOrder || 999));

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
      ALPHABET: 'Your Alphabets Lessons',
      NUMBER: 'Your Numbers Lessons',
      NAME: 'Your Names Lessons',
      SYLLABLE: 'Your Syllables Lessons'
    };
    return titles[this.currentLessonType] || 'Your Lessons';
  }

  getLessonTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      ALPHABET: 'Alphabet',
      NUMBER: 'Numbers',
      NAME: 'Names',
      SYLLABLE: 'Syllables'
    };
    return type ? labels[type] || 'Lesson' : 'Lesson';
  }

  getExampleLabel(): string {
    if (this.modalLessonType === 'NAME') {
      return 'Example Sentence *';
    } else if (this.modalLessonType === 'NUMBER') {
      return 'Example (Optional)';
    }
    return 'Example Word / Meaning *';
  }

  getExamplePlaceholder(): string {
    if (this.modalLessonType === 'NAME') {
      return 'e.g., "My name is Somchai and I am a teacher"';
    } else if (this.modalLessonType === 'NUMBER') {
      return 'e.g., 1, 2, 3 (optional for numbers)';
    }
    return 'e.g., "Gai" (chicken)';
  }

  isExampleRequired(): boolean {
    return this.modalLessonType !== 'NUMBER';
  }

  getNextOrderNumber(): number {
    const lessonsOfType = this.lessonsList.filter(l => l.type === this.currentLessonType);
    if (lessonsOfType.length === 0) return 1;
    const maxOrder = Math.max(...lessonsOfType.map(l => l.lessonOrder || 0));
    return maxOrder + 1;
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
      status: 'PUBLISHED',
      lessonOrder: this.getNextOrderNumber()
    };
    this.showLessonModal = true;
  }

  editLesson(lesson: Lesson): void {
    this.editingLesson = lesson;
    this.modalLessonType = lesson.type;
    this.newLesson = { ...lesson, lessonOrder: lesson.lessonOrder || 1 };
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
    if (type === 'NUMBER') {
      this.newLesson.example = '';
    }
  }

  async publishLesson(): Promise<void> {
    if (!this.validateLesson()) return;
    if (!this.newLesson.audioUrl) {
      this.error = 'Please upload or record audio first';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    this.newLesson.status = 'PUBLISHED';
    await this.saveLesson();
  }

  validateLesson(): boolean {
    if (!this.newLesson.title.trim()) {
      this.error = 'Please enter a lesson title';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    if (!this.newLesson.content.trim()) {
      this.error = 'Please enter content';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    if (!this.newLesson.englishEquivalent.trim()) {
      this.error = 'Please enter English equivalent';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    if (!this.newLesson.lessonOrder || this.newLesson.lessonOrder < 1) {
      this.error = 'Please enter a valid lesson order';
      setTimeout(() => this.error = '', 3000);
      return false;
    }
    return true;
  }

  async saveLesson(): Promise<void> {
    this.isLoading = true;
    try {
      if (this.useMockData) {
        if (this.editingLesson && this.editingLesson.lessonId) {
          const index = this.lessonsList.findIndex(l => l.lessonId === this.editingLesson!.lessonId);
          if (index !== -1) {
            this.lessonsList[index] = { ...this.newLesson, lessonId: this.editingLesson.lessonId };
          }
        } else {
          this.newLesson.lessonId = this.nextId++;
          this.lessonsList.push({ ...this.newLesson });
        }
        this.filterLessons();
      } else {
        let audioFile = this.newLesson.pronunciation;
        if (this.recordedBlob && !audioFile) {
          audioFile = new File([this.recordedBlob], `audio_${Date.now()}.wav`, { type: 'audio/wav' });
        }
        if (this.editingLesson && this.editingLesson.lessonId) {
          await this.lessonService.updateLesson(this.editingLesson.lessonId, this.newLesson, audioFile).toPromise();
        } else {
          await this.lessonService.addLesson(this.newLesson, audioFile).toPromise();
        }
        await this.loadLessons();
      }
      this.closeLessonCreator();
    } catch (err) {
      this.error = 'Failed to save lesson';
    } finally {
      this.isLoading = false;
    }
  }

  async toggleStatus(lesson: Lesson): Promise<void> {
    const newStatus = lesson.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    if (this.useMockData) {
      const index = this.lessonsList.findIndex(l => l.lessonId === lesson.lessonId);
      if (index !== -1) {
        this.lessonsList[index].status = newStatus;
        this.filterLessons();
      }
    } else {
      this.isLoading = true;
      try {
        await this.lessonService.toggleLessonStatus(lesson.lessonId!, newStatus).toPromise();
        await this.loadLessons();
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

  reorderLessons(): void {
    const sorted = [...this.filteredLessons].sort((a, b) => a.lessonOrder - b.lessonOrder);
    sorted.forEach((lesson, index) => { lesson.lessonOrder = index + 1; });
    sorted.forEach(updated => {
      const idx = this.lessonsList.findIndex(l => l.lessonId === updated.lessonId);
      if (idx !== -1) this.lessonsList[idx] = updated;
    });
    this.filterLessons();
  }

  // MAIN AUDIO PLAYBACK METHODS
  playLessonAudio(lesson: Lesson): void {
    if (!lesson.audioUrl) {
      this.error = 'No audio available for this lesson';
      setTimeout(() => this.error = '', 2000);
      return;
    }
    this.playAudioFromUrl(lesson.audioUrl);
  }

  playAudioFromUrl(url: string | undefined): void {
    if (!url) {
      this.error = 'No audio URL provided';
      setTimeout(() => this.error = '', 2000);
      return;
    }
    
    // Stop current audio if playing
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    
    const audio = new Audio();
    audio.src = url;
    audio.load();
    
    audio.oncanplay = () => {
      audio.play().catch(err => {
        console.error('Play error:', err);
        this.error = 'Could not play audio';
        setTimeout(() => this.error = '', 2000);
      });
    };
    
    audio.onerror = (err) => {
      console.error('Audio error:', err);
      this.error = 'Failed to load audio';
      setTimeout(() => this.error = '', 2000);
    };
    
    this.currentAudio = audio;
    
    audio.onended = () => {
      this.currentAudio = null;
    };
  }

  testAudioPlayback(url: string | undefined): void {
    this.playAudioFromUrl(url);
  }

  triggerAudioUpload(): void {
    this.audioFileInput?.nativeElement.click();
  }

  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (this.newLesson.audioUrl && this.newLesson.audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.newLesson.audioUrl);
      }
      this.newLesson.pronunciation = file;
      this.newLesson.audioUrl = URL.createObjectURL(file);
      this.recordedBlob = null;
      this.cdr.detectChanges();
    }
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.onstop = () => {
        if (this.audioChunks.length > 0) {
          this.recordedBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          if (this.newLesson.audioUrl && this.newLesson.audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(this.newLesson.audioUrl);
          }
          this.newLesson.audioUrl = URL.createObjectURL(this.recordedBlob);
          this.newLesson.pronunciation = new File([this.recordedBlob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
          this.cdr.detectChanges();
        }
        stream.getTracks().forEach(track => track.stop());
      };
      
      this.mediaRecorder.start(100);
      this.isRecording = true;
      this.startRecordingTimer();
    } catch (err) {
      this.error = 'Unable to access microphone';
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
    if (this.newLesson.audioUrl && this.newLesson.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.newLesson.audioUrl);
    }
    this.newLesson.audioUrl = undefined;
    this.newLesson.pronunciation = undefined;
    this.recordedBlob = null;
    this.audioChunks = [];
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