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
  useMockData: boolean = true;

  lessonsList: Lesson[] = [];
  filteredLessons: Lesson[] = [];
  searchTerm: string = '';
  currentLessonType: 'NUMBER' | 'LANGUAGE_SYSTEM' | 'NAMES' = 'NUMBER';
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
  temporaryAudioUrl: string | null = null;

  newLesson: Lesson = {
    type: 'NUMBER',
    name: '',
    title: '',
    content: '',
    writtenPronunciation: '',
    example: '',
    englishEquivalent: '',
    status: 'PUBLISHED',
    lessonOrder: 1
  };

  modalLessonType: 'NUMBER' | 'LANGUAGE_SYSTEM' | 'NAMES' = 'NUMBER';
  private nextId: number = 7;
  private subscriptions: Subscription = new Subscription();
  private currentAudio: HTMLAudioElement | null = null;

  validationErrors: {
    name?: string;
    title?: string;
    content?: string;
    englishEquivalent?: string;
    lessonOrder?: string;
    audio?: string;
  } = {};

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
          console.log("Lessons loaded:", lessons);
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
    if (this.temporaryAudioUrl) {
      URL.revokeObjectURL(this.temporaryAudioUrl);
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
            console.log("Lessons loaded from backend:", lessons);
            this.lessonsList = lessons;
            this.filterLessons();
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load lessons:', error);
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
        type: 'NUMBER',
        name: 'Thai Numbers 1-10',
        title: 'Basic Counting',
        content: '๑,๒,๓,๔,๕,๖,๗,๘,๙,๑๐',
        writtenPronunciation: 'nueng, song, sam, si, ha, hok, jet, paet, kao, sip',
        example: '๑ (1), ๒ (2), ๓ (3)',
        englishEquivalent: 'One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten',
        status: 'PUBLISHED',
        lessonOrder: 1,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      },
      {
        lessonId: 2,
        type: 'LANGUAGE_SYSTEM',
        name: 'Thai Syllable Blending',
        title: 'Consonant Clusters',
        content: 'กา → กระ',
        writtenPronunciation: 'ka → kra',
        example: '15 combinations for consonant cluster blending',
        englishEquivalent: 'Syllable blending practice',
        status: 'PUBLISHED',
        lessonOrder: 1,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
      },
      {
        lessonId: 3,
        type: 'NUMBER',
        name: 'Thai Numbers 11-20',
        title: 'Advanced Counting',
        content: '๑๑,๑๒,๑๓,๑๔,๑๕,๑๖,๑๗,๑๘,๑๙,๒๐',
        writtenPronunciation: 'sip-et, sip-song, sip-sam, sip-si, sip-ha, sip-hok, sip-jet, sip-paet, sip-kao, yee-sip',
        example: '๑๑ (11), ๑๒ (12)',
        englishEquivalent: 'Eleven, Twelve, Thirteen, Fourteen, Fifteen, Sixteen, Seventeen, Eighteen, Nineteen, Twenty',
        status: 'PUBLISHED',
        lessonOrder: 2,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
      },
      {
        lessonId: 4,
        type: 'LANGUAGE_SYSTEM',
        name: 'Thai Tone Marks',
        title: 'Tone System',
        content: 'ไม้เอก ( ่ ), ไม้โท ( ้ ), ไม้ตรี ( ๊ ), ไม้จัตวา ( ๋ )',
        writtenPronunciation: 'mai ek, mai tho, mai tri, mai chattawa',
        example: 'กา (falling), ข่า (low), ข้า (falling), ข้า (high)',
        englishEquivalent: 'Thai tone marks and their usage',
        status: 'PUBLISHED',
        lessonOrder: 2,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
      },
      {
        lessonId: 5,
        type: 'NAMES',
        name: 'Somchai',
        title: '',
        content: '',
        writtenPronunciation: '',
        example: '',
        englishEquivalent: 'Victory',
        status: 'PUBLISHED',
        lessonOrder: 1,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
      },
      {
        lessonId: 6,
        type: 'NAMES',
        name: 'Malee',
        title: '',
        content: '',
        writtenPronunciation: '',
        example: '',
        englishEquivalent: 'Jasmine Flower',
        status: 'PUBLISHED',
        lessonOrder: 2,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
      }
    ];
    this.nextId = 7;
  }

  isNameType(lesson: Lesson): boolean {
    return lesson.type === 'NAMES';
  }

  isNotNameType(lesson: Lesson): boolean {
    return lesson.type !== 'NAMES';
  }

  isModalNameType(): boolean {
    return this.modalLessonType === 'NAMES';
  }

  isNotModalNameType(): boolean {
    return this.modalLessonType !== 'NAMES';
  }

  isSelectedNameType(): boolean {
    return this.selectedLessonForPreview?.type === 'NAMES';
  }

  isNotSelectedNameType(): boolean {
    return this.selectedLessonForPreview?.type !== 'NAMES';
  }

  filterLessons(): void {
    let filtered = [...this.lessonsList];

    filtered = filtered.filter(lesson => lesson.type === this.currentLessonType);

    if (this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(lesson =>
        lesson.name.toLowerCase().includes(searchLower) ||
        (lesson.title && lesson.title.toLowerCase().includes(searchLower)) ||
        (lesson.content && lesson.content.toLowerCase().includes(searchLower)) ||
        (lesson.writtenPronunciation && lesson.writtenPronunciation.toLowerCase().includes(searchLower)) ||
        lesson.englishEquivalent.toLowerCase().includes(searchLower)
      );
    }

    this.filteredLessons = filtered.sort((a, b) => (a.lessonOrder || 999) - (b.lessonOrder || 999));
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

  switchLessonTab(type: 'NUMBER' | 'LANGUAGE_SYSTEM' | 'NAMES'): void {
    this.currentLessonType = type;
    this.searchTerm = '';
    this.filterLessons();
  }

  setViewMode(mode: string): void {
    this.viewMode = mode;
  }

  getSectionTitle(): string {
    const titles: Record<string, string> = {
      NUMBER: 'Numbers Lessons',
      LANGUAGE_SYSTEM: 'Language Systems',
      NAMES: 'Names'
    };
    return titles[this.currentLessonType] || 'Lessons';
  }

  getLessonTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      NUMBER: 'Numbers',
      LANGUAGE_SYSTEM: 'Language System',
      NAMES: 'Name'
    };
    return type ? labels[type] || 'Lesson' : 'Lesson';
  }

  getExampleLabel(): string {
    if (this.modalLessonType === 'LANGUAGE_SYSTEM') {
      return 'Example / Context *';
    }
    return 'Example (Optional)';
  }

  getExamplePlaceholder(): string {
    if (this.modalLessonType === 'LANGUAGE_SYSTEM') {
      return 'e.g., "Used in formal writing" or "Common in everyday speech"';
    }
    return 'e.g., 1, 2, 3 (optional)';
  }

  isExampleRequired(): boolean {
    return this.modalLessonType === 'LANGUAGE_SYSTEM';
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
    this.validationErrors = {}; // Reset validation errors
    
    if (this.modalLessonType === 'NAMES') {
      this.newLesson = {
        type: 'NAMES',
        name: '',
        title: '',
        content: '',
        writtenPronunciation: '',
        example: '',
        englishEquivalent: '',
        status: 'PUBLISHED',
        lessonOrder: this.getNextOrderNumber()
      };
    } else {
      this.newLesson = {
        type: this.modalLessonType,
        name: '',
        title: '',
        content: '',
        writtenPronunciation: '',
        example: '',
        englishEquivalent: '',
        status: 'PUBLISHED',
        lessonOrder: this.getNextOrderNumber()
      };
    }
    
    this.showLessonModal = true;
    if (this.temporaryAudioUrl) {
      URL.revokeObjectURL(this.temporaryAudioUrl);
      this.temporaryAudioUrl = null;
    }
  }

  editLesson(lesson: Lesson): void {
    this.editingLesson = lesson;
    this.modalLessonType = lesson.type;
    this.validationErrors = {}; // Reset validation errors
    this.newLesson = { ...lesson, lessonOrder: lesson.lessonOrder || 1 };
    this.showLessonModal = true;
  }

  closeLessonCreator(): void {
    this.showLessonModal = false;
    this.editingLesson = null;
    this.validationErrors = {}; 
    this.stopRecording();
    if (this.temporaryAudioUrl) {
      URL.revokeObjectURL(this.temporaryAudioUrl);
      this.temporaryAudioUrl = null;
    }
    this.recordedBlob = null;
  }

  switchModalLessonType(type: 'NUMBER' | 'LANGUAGE_SYSTEM' | 'NAMES'): void {
    this.modalLessonType = type;
    this.newLesson.type = type;
    this.validationErrors = {}; 
    
    if (type === 'NAMES') {
      this.newLesson.title = '';
      this.newLesson.content = '';
      this.newLesson.writtenPronunciation = '';
      this.newLesson.example = '';
    } else if (type === 'NUMBER') {
      this.newLesson.example = '';
    }
  }

  async publishLesson(): Promise<void> {
    if (!this.validateLesson()) {
      this.cdr.detectChanges();
      return;
    }
    
    this.newLesson.status = 'PUBLISHED';
    await this.saveLesson();
  }

  validateLesson(): boolean {
    this.validationErrors = {};
    let isValid = true;
    
    if (!this.newLesson.name?.trim()) {
      this.validationErrors.name = 'Lesson name is required';
      isValid = false;
    }
    
    if (!this.newLesson.englishEquivalent?.trim()) {
      this.validationErrors.englishEquivalent = 'English translation is required';
      isValid = false;
    }
    
    if (!this.newLesson.lessonOrder || this.newLesson.lessonOrder < 1) {
      this.validationErrors.lessonOrder = 'Valid lesson order is required (minimum 1)';
      isValid = false;
    }
    
    if (this.modalLessonType !== 'NAMES') {
      if (!this.newLesson.title?.trim()) {
        this.validationErrors.title = 'Lesson title is required';
        isValid = false;
      }
      if (!this.newLesson.content?.trim()) {
        this.validationErrors.content = 'Content is required';
        isValid = false;
      }
    }
    
    if (!this.newLesson.audioUrl && !this.newLesson.pronunciation) {
      this.validationErrors.audio = 'Please upload or record audio pronunciation';
      isValid = false;
    }
    
    return isValid;
  }

  async fileToDataUrl(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'audio/wav';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  async saveLesson(): Promise<void> {
    this.isLoading = true;
    try {
      if (this.useMockData) {
        let audioDataUrl = this.newLesson.audioUrl;

        if (this.recordedBlob && !audioDataUrl?.startsWith('data:')) {
          audioDataUrl = await this.fileToDataUrl(this.recordedBlob);
        } else if (this.newLesson.pronunciation && !audioDataUrl?.startsWith('data:')) {
          audioDataUrl = await this.fileToDataUrl(this.newLesson.pronunciation);
        }

        const lessonToSave = { ...this.newLesson };
        if (audioDataUrl) {
          lessonToSave.audioUrl = audioDataUrl;
        }

        if (this.editingLesson && this.editingLesson.lessonId) {
          const index = this.lessonsList.findIndex(l => l.lessonId === this.editingLesson!.lessonId);
          if (index !== -1) {
            this.lessonsList[index] = { ...lessonToSave, lessonId: this.editingLesson.lessonId };
          }
        } else {
          lessonToSave.lessonId = this.nextId++;
          this.lessonsList.push(lessonToSave);
        }
        this.filterLessons();
        this.closeLessonCreator();
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
        this.closeLessonCreator();
        await this.loadLessons();
        this.isLoading = false;
        this.closeLessonCreator();
        this.cdr.detectChanges();
      }
    } catch (err) {
      console.error('Save error:', err);
      this.error = 'Failed to save lesson';
      setTimeout(() => this.error = '', 3000);
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
        this.cdr.detectChanges();
      }
    } else {
      this.isLoading = true;
      try {
        await this.lessonService.toggleLessonStatus(lesson.lessonId!, newStatus).toPromise();
        await this.loadLessons();
        this.cdr.detectChanges();
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
      this.editLesson(this.selectedLessonForPreview);
      this.closePreviewModal();
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

  playAudio(lesson: Lesson | null): void {
    if (!lesson) {
      this.error = 'No lesson selected';
      setTimeout(() => this.error = '', 2000);
      return;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    let audioUrl = lesson.audioUrl;

    if (!audioUrl) {
      this.error = 'No audio available for this lesson';
      setTimeout(() => this.error = '', 2000);
      return;
    }

    console.log('Playing audio from URL:', audioUrl);

    const audio = new Audio(audioUrl);
    audio.load();

    audio.oncanplay = () => {
      audio.play().catch(err => {
        console.error('Playback error:', err);
        this.error = 'Cannot play audio. Format may not be supported.';
        setTimeout(() => this.error = '', 2000);
      });
    };

    audio.onerror = (err) => {
      console.error('Audio loading error:', err);
      this.error = 'Failed to load audio file';
      setTimeout(() => this.error = '', 2000);
    };

    this.currentAudio = audio;

    audio.onended = () => {
      this.currentAudio = null;
    };
  }

  triggerAudioUpload(): void {
    this.audioFileInput?.nativeElement.click();
  }

  async onAudioSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (this.useMockData) {
        const dataUrl = await this.fileToDataUrl(file);
        this.newLesson.audioUrl = dataUrl;
        this.newLesson.pronunciation = undefined;
        if (this.temporaryAudioUrl) {
          URL.revokeObjectURL(this.temporaryAudioUrl);
        }
        this.temporaryAudioUrl = URL.createObjectURL(file);
      } else {
        if (this.temporaryAudioUrl) {
          URL.revokeObjectURL(this.temporaryAudioUrl);
        }
        this.temporaryAudioUrl = URL.createObjectURL(file);
        this.newLesson.audioUrl = this.temporaryAudioUrl;
        this.newLesson.pronunciation = file;
      }

      if (this.validationErrors.audio) {
        delete this.validationErrors.audio;
      }
      
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

      this.mediaRecorder.onstop = async () => {
        if (this.audioChunks.length > 0) {
          this.recordedBlob = new Blob(this.audioChunks, { type: 'audio/wav' });

          if (this.useMockData) {
            const dataUrl = await this.fileToDataUrl(this.recordedBlob);
            this.newLesson.audioUrl = dataUrl;
            this.newLesson.pronunciation = undefined;
          } else {
            if (this.temporaryAudioUrl) {
              URL.revokeObjectURL(this.temporaryAudioUrl);
            }
            this.temporaryAudioUrl = URL.createObjectURL(this.recordedBlob);
            this.newLesson.audioUrl = this.temporaryAudioUrl;
            this.newLesson.pronunciation = new File([this.recordedBlob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
          }
          
          if (this.validationErrors.audio) {
            delete this.validationErrors.audio;
          }
          
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
    if (this.temporaryAudioUrl) {
      URL.revokeObjectURL(this.temporaryAudioUrl);
      this.temporaryAudioUrl = null;
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