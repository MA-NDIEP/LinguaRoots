import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../side-bar/side-bar';
import { NavbarComponent } from '../nav-bar/nav-bar';
import * as XLSX from 'xlsx';
import { LessonService } from '../../Services/lesson';

export interface DictionaryWord {
  wordId?: number;
  word: string;
  translation: string;
  example: string;
  exampleTranslation: string;
  audioUrl?: string;
  createdAt?: Date;
}

export interface Alphabet {
  id: number;
  character: string;
  nativePronunciation: string;
  englishEquivalent: string;
  nativeExample: string;
  englishExample: string;
  createdAt?: Date;
}

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent],
  templateUrl: './dictionary.html',
  styleUrl: './dictionary.css',
})
export class DictionaryComponent implements OnInit {
  @ViewChild('wordForm') wordFormElement!: ElementRef;
  @ViewChild('alphabetForm') alphabetFormElement!: ElementRef;
  @ViewChild('alphabetAudioInput') alphabetAudioInput!: ElementRef<HTMLInputElement>;
  @ViewChild('wordAudioInput') wordAudioInput!: ElementRef<HTMLInputElement>;

  words: DictionaryWord[] = [];
  filteredWords: DictionaryWord[] = [];

  // Alphabet properties
  alphabets: Alphabet[] = [];
  filteredAlphabets: Alphabet[] = [];
  isLoadingAlphabets: boolean = false;
  alphabetError: string = '';
  useMockAlphabets: boolean = false;
  showAlphabetForm: boolean = false;
  editingAlphabetId: number | null = null;

  audioFileDeleted: boolean = false;
  deletedAudioUrl: string | null = null;
  originalNativePronunciation: string | null = null;

  wordAudioFileDeleted: boolean = false;
  wordDeletedAudioUrl: string | null = null;
  originalWordAudioUrl: string | null = null;

  // Validation errors
  validationErrors: {
    word?: string;
    translation?: string;
    character?: string;
  } = {};

  // Alphabet form model
  currentAlphabet: Alphabet = {
    id: 0,
    character: '',
    nativePronunciation: '',
    englishEquivalent: '',
    nativeExample: '',
    englishExample: ''
  };

  // Alphabet pagination
  alphabetCurrentPage: number = 1;
  alphabetItemsPerPage: number = 10;

  // Word audio upload
  selectedWordAudioFile: File | null = null;
  uploadingAudio: boolean = false;
  audioUploadWordId: number | null = null;
  wordAudioPreviewUrl: string | null = null;

  // Alphabet audio upload (for native pronunciation)
  selectedAlphabetAudioFile: File | null = null;
  uploadingAlphabetAudio: boolean = false;
  audioUploadAlphabetId: number | null = null;
  alphabetAudioPreviewUrl: string | null = null;

  // Recording properties for Alphabet
  isAlphabetRecording: boolean = false;
  alphabetMediaRecorder: MediaRecorder | null = null;
  alphabetAudioChunks: Blob[] = [];
  alphabetRecordingTime: string = '00:00';
  alphabetRecordingSeconds: number = 0;
  alphabetRecordingInterval: any;

  // Recording properties for Word
  isWordRecording: boolean = false;
  wordMediaRecorder: MediaRecorder | null = null;
  wordAudioChunks: Blob[] = [];
  wordRecordingTime: string = '00:00';
  wordRecordingSeconds: number = 0;
  wordRecordingInterval: any;

  // Form model for adding/editing words
  currentWord: DictionaryWord = {
    word: '',
    translation: '',
    example: '',
    exampleTranslation: '',
    audioUrl: ''
  };

  editingId: number | null = null;
  searchTerm: string = '';
  showForm: boolean = false;

  // File import
  selectedFile: File | null = null;
  importError: string = '';
  importSuccess: string = '';

  // Pagination for words
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Modal properties
  showDeleteModal: boolean = false;
  showValidationModal: boolean = false;
  validationMessage: string = '';
  validationType: 'success' | 'error' = 'error';
  pendingDeleteId: number | null = null;
  pendingDeleteAlphabetId: number | null = null;
  showDeleteAlphabetModal: boolean = false;

  // Import/Export loading states
  isImporting: boolean = false;
  isExporting: boolean = false;

  // Audio playback
  private currentAudio: HTMLAudioElement | null = null;

  constructor(
    private lessonService: LessonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWords();
    this.loadAlphabets();
  }

  scrollToWordForm(): void {
    setTimeout(() => {
      if (this.wordFormElement && this.wordFormElement.nativeElement) {
        this.wordFormElement.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        this.wordFormElement.nativeElement.classList.add('highlight-form');
        setTimeout(() => {
          if (this.wordFormElement && this.wordFormElement.nativeElement) {
            this.wordFormElement.nativeElement.classList.remove('highlight-form');
          }
        }, 1500);
      }
    }, 150);
  }

  scrollToAlphabetForm(): void {
    setTimeout(() => {
      if (this.alphabetFormElement && this.alphabetFormElement.nativeElement) {
        this.alphabetFormElement.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        this.alphabetFormElement.nativeElement.classList.add('highlight-form');
        setTimeout(() => {
          if (this.alphabetFormElement && this.alphabetFormElement.nativeElement) {
            this.alphabetFormElement.nativeElement.classList.remove('highlight-form');
          }
        }, 1500);
      }
    }, 150);
  }

  openWordForm(): void {
    this.showForm = true;
    this.resetForm();
    this.editingId = null;
    this.selectedWordAudioFile = null;
    this.wordAudioPreviewUrl = null;
    this.validationErrors = {};
    this.cdr.detectChanges();
    this.scrollToWordForm();
  }

  loadAlphabets(): void {
    if (this.useMockAlphabets) {
      this.loadMockAlphabets();
    } else {
      this.loadAlphabetsFromBackend();
    }
  }

  loadMockAlphabets(): void {
    this.isLoadingAlphabets = true;

    setTimeout(() => {
      this.alphabets = [
        { id: 1, character: 'Aa', nativePronunciation: '', englishEquivalent: 'Alpha', nativeExample: 'Apple', englishExample: 'Apple', createdAt: new Date() },
        { id: 2, character: 'Bb', nativePronunciation: '', englishEquivalent: 'Beta', nativeExample: 'Ball', englishExample: 'Ball', createdAt: new Date() },
        { id: 3, character: 'Dd', nativePronunciation: '', englishEquivalent: 'Delta', nativeExample: 'Dog', englishExample: 'Dog', createdAt: new Date() },
        { id: 4, character: 'Ee', nativePronunciation: '', englishEquivalent: 'Epsilon', nativeExample: 'Egg', englishExample: 'Egg', createdAt: new Date() },
        { id: 5, character: 'Ê', nativePronunciation: '', englishEquivalent: 'E with Circumflex', nativeExample: 'Fête', englishExample: 'Party', createdAt: new Date() },
        { id: 6, character: 'Ë', nativePronunciation: '', englishEquivalent: 'E with Diaeresis', nativeExample: 'Noël', englishExample: 'Christmas', createdAt: new Date() },
        { id: 7, character: 'Ff', nativePronunciation: '', englishEquivalent: 'Phi', nativeExample: 'Fish', englishExample: 'Fish', createdAt: new Date() },
        { id: 8, character: 'Gg', nativePronunciation: '', englishEquivalent: 'Gamma', nativeExample: 'Go', englishExample: 'Go', createdAt: new Date() },
        { id: 9, character: 'Gh gh', nativePronunciation: '', englishEquivalent: 'Gha', nativeExample: 'Ghost', englishExample: 'Ghost', createdAt: new Date() },
        { id: 10, character: 'Ii', nativePronunciation: '', englishEquivalent: 'Iota', nativeExample: 'Ink', englishExample: 'Ink', createdAt: new Date() }
      ];

      this.filteredAlphabets = [...this.alphabets];
      this.isLoadingAlphabets = false;
      this.cdr.detectChanges();
    }, 500);
  }

  loadAlphabetsFromBackend(): void {
    this.isLoadingAlphabets = true;
    this.alphabetError = '';

    this.lessonService.getAllAlphabets().subscribe({
      next: (alphabets) => {
        if (alphabets) {
          this.alphabets = alphabets;
          this.filteredAlphabets = [...this.alphabets];
          this.isLoadingAlphabets = false;
          this.cdr.detectChanges();
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load alphabets:', error);
        this.cdr.detectChanges();
      }
    });
  }

  addAlphabet(): void {
    this.showAlphabetForm = true;
    this.editingAlphabetId = null;
    this.selectedAlphabetAudioFile = null;
    this.alphabetAudioPreviewUrl = null;
    this.validationErrors = {};
    this.currentAlphabet = {
      id: 0,
      character: '',
      nativePronunciation: '',
      englishEquivalent: '',
      nativeExample: '',
      englishExample: ''
    };
    this.cdr.detectChanges();
    this.scrollToAlphabetForm();
  }

  editAlphabet(alphabet: Alphabet): void {
    this.currentAlphabet = { ...alphabet };
    this.editingAlphabetId = alphabet.id;
    this.showAlphabetForm = true;
    this.selectedAlphabetAudioFile = null;
    this.alphabetAudioPreviewUrl = null;
    this.validationErrors = {};
    // Store original audio for deletion tracking
    this.originalNativePronunciation = alphabet.nativePronunciation || null;
    this.audioFileDeleted = false;
    this.deletedAudioUrl = null;
    this.cdr.detectChanges();
    this.scrollToAlphabetForm();
  }

  saveAlphabet(): void {
    if (!this.currentAlphabet.character.trim()) {
      this.showValidationModalMessage('Please enter the character/symbol', 'error');
      return;
    }

    const alphabetData = { ...this.currentAlphabet };

    if (this.editingAlphabetId !== null) {
      this.lessonService.updateAlphabet(
        this.editingAlphabetId,
        alphabetData,
        this.selectedAlphabetAudioFile || undefined,
        this.audioFileDeleted,
        this.deletedAudioUrl
      ).subscribe({
        next: () => {
          this.showValidationModalMessage('Alphabet updated successfully!', 'success');
          this.resetAlphabetForm();
          this.loadAlphabets();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Update error:', err);
          this.showValidationModalMessage('Failed to update alphabet.', 'error');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.lessonService.addAlphabet(alphabetData, this.selectedAlphabetAudioFile || undefined).subscribe({
        next: () => {
          this.showValidationModalMessage('Alphabet added successfully!', 'success');
          this.resetAlphabetForm();
          this.loadAlphabets();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Add error:', err);
          this.showValidationModalMessage('Failed to add alphabet.', 'error');
          this.cdr.detectChanges();
        }
      });
    }

    this.filterAlphabets();
    this.showAlphabetForm = false;
    this.alphabetAudioPreviewUrl = null;
    this.cdr.detectChanges();
  }

  resetAlphabetForm(): void {
    this.editingAlphabetId = null;
    this.selectedAlphabetAudioFile = null;
    this.audioFileDeleted = false;
    this.deletedAudioUrl = null;
    this.originalNativePronunciation = null;
    if (this.alphabetAudioPreviewUrl) {
      URL.revokeObjectURL(this.alphabetAudioPreviewUrl);
      this.alphabetAudioPreviewUrl = null;
    }
  }

  // ========== ALPHABET AUDIO METHODS ==========

  triggerAlphabetAudioUpload(): void {
    this.alphabetAudioInput?.nativeElement.click();
  }

  async startAlphabetRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.alphabetMediaRecorder = new MediaRecorder(stream);
      this.alphabetAudioChunks = [];

      this.alphabetMediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.alphabetAudioChunks.push(event.data);
        }
      };

      this.alphabetMediaRecorder.onstop = () => {
        if (this.alphabetAudioChunks.length > 0) {
          const audioBlob = new Blob(this.alphabetAudioChunks, { type: 'audio/wav' });

          if (this.alphabetAudioPreviewUrl) {
            URL.revokeObjectURL(this.alphabetAudioPreviewUrl);
          }
          this.alphabetAudioPreviewUrl = URL.createObjectURL(audioBlob);
          this.selectedAlphabetAudioFile = new File([audioBlob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
          this.audioUploadAlphabetId = this.editingAlphabetId || 0;
          this.cdr.detectChanges();
        }
        stream.getTracks().forEach(track => track.stop());
      };

      this.alphabetMediaRecorder.start(100);
      this.isAlphabetRecording = true;
      this.startAlphabetRecordingTimer();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      this.showValidationModalMessage('Unable to access microphone. Please check permissions.', 'error');
    }
  }

  stopAlphabetRecording(): void {
    if (this.alphabetMediaRecorder && this.isAlphabetRecording) {
      this.alphabetMediaRecorder.stop();
      this.isAlphabetRecording = false;
      this.stopAlphabetRecordingTimer();
    }
  }

  startAlphabetRecordingTimer(): void {
    this.alphabetRecordingSeconds = 0;
    this.alphabetRecordingInterval = setInterval(() => {
      this.alphabetRecordingSeconds++;
      const minutes = Math.floor(this.alphabetRecordingSeconds / 60);
      const seconds = this.alphabetRecordingSeconds % 60;
      this.alphabetRecordingTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      this.cdr.detectChanges();
    }, 1000);
  }

  stopAlphabetRecordingTimer(): void {
    if (this.alphabetRecordingInterval) {
      clearInterval(this.alphabetRecordingInterval);
      this.alphabetRecordingInterval = null;
    }
  }

  onAlphabetAudioFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      this.selectedAlphabetAudioFile = file;
      this.audioUploadAlphabetId = this.editingAlphabetId || 0;

      if (this.alphabetAudioPreviewUrl) {
        URL.revokeObjectURL(this.alphabetAudioPreviewUrl);
      }
      this.alphabetAudioPreviewUrl = URL.createObjectURL(file);
      this.cdr.detectChanges();
    } else if (file) {
      this.showValidationModalMessage('Please select a valid audio file', 'error');
    }
  }

  clearAlphabetAudio(): void {
    if (this.alphabetAudioPreviewUrl) {
      URL.revokeObjectURL(this.alphabetAudioPreviewUrl);
      this.alphabetAudioPreviewUrl = null;
    }

    // Track if we're deleting existing audio from a saved alphabet
    if (this.editingAlphabetId !== null && this.originalNativePronunciation) {
      this.audioFileDeleted = true;
      this.deletedAudioUrl = this.originalNativePronunciation;
    }

    this.selectedAlphabetAudioFile = null;
    this.audioUploadAlphabetId = null;
    this.cdr.detectChanges();
  }

  removeAlphabetAudio(): void {
    // Track deletion if editing existing alphabet with audio
    if (this.editingAlphabetId !== null && this.originalNativePronunciation) {
      this.audioFileDeleted = true;
      this.deletedAudioUrl = this.originalNativePronunciation;
    }

    this.currentAlphabet.nativePronunciation = '';
    this.clearAlphabetAudio();
  }

  uploadAlphabetAudio(): void {
    if (!this.selectedAlphabetAudioFile) return;

    this.uploadingAlphabetAudio = true;

    setTimeout(() => {
      const audioUrl = this.alphabetAudioPreviewUrl;
      if (this.audioUploadAlphabetId !== null) {
        const alphabet = this.alphabets.find(a => a.id === this.audioUploadAlphabetId);
        if (alphabet) {
          alphabet.nativePronunciation = audioUrl || '';
        }
        if (this.editingAlphabetId === this.audioUploadAlphabetId) {
          this.currentAlphabet.nativePronunciation = audioUrl || '';
        }
      }
      this.uploadingAlphabetAudio = false;
      this.selectedAlphabetAudioFile = null;
      this.audioUploadAlphabetId = null;
      this.alphabetAudioPreviewUrl = null;
      this.showValidationModalMessage('Audio saved successfully!', 'success');
      this.cdr.detectChanges();
    }, 500);
  }

  // ========== WORD AUDIO METHODS ==========

  triggerWordAudioUpload(): void {
    this.wordAudioInput?.nativeElement.click();
  }

  async startWordRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.wordMediaRecorder = new MediaRecorder(stream);
      this.wordAudioChunks = [];

      this.wordMediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.wordAudioChunks.push(event.data);
        }
      };

      this.wordMediaRecorder.onstop = () => {
        if (this.wordAudioChunks.length > 0) {
          const audioBlob = new Blob(this.wordAudioChunks, { type: 'audio/wav' });

          if (this.wordAudioPreviewUrl) {
            URL.revokeObjectURL(this.wordAudioPreviewUrl);
          }
          this.wordAudioPreviewUrl = URL.createObjectURL(audioBlob);
          this.selectedWordAudioFile = new File([audioBlob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
          this.audioUploadWordId = this.editingId || 0;
          this.cdr.detectChanges();
        }
        stream.getTracks().forEach(track => track.stop());
      };

      this.wordMediaRecorder.start(100);
      this.isWordRecording = true;
      this.startWordRecordingTimer();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      this.showValidationModalMessage('Unable to access microphone. Please check permissions.', 'error');
    }
  }

  stopWordRecording(): void {
    if (this.wordMediaRecorder && this.isWordRecording) {
      this.wordMediaRecorder.stop();
      this.isWordRecording = false;
      this.stopWordRecordingTimer();
    }
  }

  startWordRecordingTimer(): void {
    this.wordRecordingSeconds = 0;
    this.wordRecordingInterval = setInterval(() => {
      this.wordRecordingSeconds++;
      const minutes = Math.floor(this.wordRecordingSeconds / 60);
      const seconds = this.wordRecordingSeconds % 60;
      this.wordRecordingTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      this.cdr.detectChanges();
    }, 1000);
  }

  stopWordRecordingTimer(): void {
    if (this.wordRecordingInterval) {
      clearInterval(this.wordRecordingInterval);
      this.wordRecordingInterval = null;
    }
  }

  onWordAudioFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      this.selectedWordAudioFile = file;
      this.audioUploadWordId = this.editingId || 0;

      if (this.wordAudioPreviewUrl) {
        URL.revokeObjectURL(this.wordAudioPreviewUrl);
      }
      this.wordAudioPreviewUrl = URL.createObjectURL(file);
      this.cdr.detectChanges();
    } else if (file) {
      this.showValidationModalMessage('Please select a valid audio file', 'error');
    }
  }

  clearWordAudio(): void {
    if (this.wordAudioPreviewUrl) {
      URL.revokeObjectURL(this.wordAudioPreviewUrl);
      this.wordAudioPreviewUrl = null;
    }

    // Track if we're deleting existing audio from a saved word
    if (this.editingId !== null && this.originalWordAudioUrl) {
      this.wordAudioFileDeleted = true;
      this.wordDeletedAudioUrl = this.originalWordAudioUrl;
    }

    this.selectedWordAudioFile = null;
    this.audioUploadWordId = null;

    // Clear the audio URL from current word object
    if (this.currentWord) {
      this.currentWord.audioUrl = undefined;
    }

    this.cdr.detectChanges();
  }

  removeWordAudio(): void {
    // Track deletion if editing existing word with audio
    if (this.editingId !== null && this.originalWordAudioUrl) {
      this.wordAudioFileDeleted = true;
      this.wordDeletedAudioUrl = this.originalWordAudioUrl;
    }

    this.currentWord.audioUrl = undefined;
    this.clearWordAudio();
  }

  uploadWordAudio(): void {
    if (!this.selectedWordAudioFile) return;

    this.uploadingAudio = true;

    setTimeout(() => {
      const audioUrl = this.wordAudioPreviewUrl;
      if (this.audioUploadWordId !== null) {
        const word = this.words.find(w => w.wordId === this.audioUploadWordId);
        if (word) {
          word.audioUrl = audioUrl || undefined;
        }
        if (this.editingId === this.audioUploadWordId) {
          this.currentWord.audioUrl = audioUrl || undefined;
        }
      }
      this.uploadingAudio = false;
      this.selectedWordAudioFile = null;
      this.audioUploadWordId = null;
      this.wordAudioPreviewUrl = null;
      this.showValidationModalMessage('Audio saved successfully!', 'success');
      this.cdr.detectChanges();
    }, 500);
  }

  // ========== COMMON METHODS ==========

  playAudio(audioUrl: string | undefined): void {
    if (!audioUrl) {
      this.cdr.detectChanges();
      this.showValidationModalMessage('No audio available', 'error');
      this.cdr.detectChanges();
      return;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    const audio = new Audio();
    audio.src = audioUrl;
    audio.load();

    audio.oncanplay = () => {
      audio.play().catch(err => {
        console.error('Play error:', err);
        this.showValidationModalMessage('Could not play audio', 'error');
      });
    };

    audio.onerror = () => {
      console.error('Audio error');
      this.showValidationModalMessage('Failed to load audio', 'error');
    };

    this.currentAudio = audio;

    audio.onended = () => {
      this.currentAudio = null;
    };
    this.cdr.detectChanges();
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  // ========== ALPHABET CRUD ==========

  openDeleteAlphabetModal(id: number): void {
    this.pendingDeleteAlphabetId = id;
    this.showDeleteAlphabetModal = true;
  }

  confirmDeleteAlphabet(): void {
    if (this.pendingDeleteAlphabetId !== null) {
      this.lessonService.deleteAlphabet(this.pendingDeleteAlphabetId).subscribe({
        next: () => {
          if (this.editingAlphabetId === this.pendingDeleteAlphabetId) {
            this.resetForm();
          }
          this.showValidationModalMessage('Alphabet deleted successfully!', 'success');
          this.closeDeleteAlphabetModal();
          this.pendingDeleteAlphabetId = null;
          this.loadAlphabets();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.showValidationModalMessage('Failed to delete word.', 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  closeDeleteAlphabetModal(): void {
    this.showDeleteAlphabetModal = false;
    this.pendingDeleteAlphabetId = null;
  }

  filterAlphabets(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAlphabets = [...this.alphabets];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredAlphabets = this.alphabets.filter(alphabet =>
        alphabet.character.toLowerCase().includes(term) ||
        (alphabet.englishEquivalent && alphabet.englishEquivalent.toLowerCase().includes(term)) ||
        (alphabet.nativeExample && alphabet.nativeExample.toLowerCase().includes(term)) ||
        (alphabet.englishExample && alphabet.englishExample.toLowerCase().includes(term))
      );
    }
    this.alphabetCurrentPage = 1;
  }

  getPaginatedAlphabets(): Alphabet[] {
    const startIndex = (this.alphabetCurrentPage - 1) * this.alphabetItemsPerPage;
    return this.filteredAlphabets.slice(startIndex, startIndex + this.alphabetItemsPerPage);
  }

  getAlphabetTotalPages(): number {
    return Math.ceil(this.filteredAlphabets.length / this.alphabetItemsPerPage);
  }

  getAlphabetPageNumbers(): (number | string)[] {
    const totalPages = this.getAlphabetTotalPages();
    const currentPage = this.alphabetCurrentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  }

  alphabetPreviousPage(): void {
    if (this.alphabetCurrentPage > 1) this.alphabetCurrentPage--;
  }

  alphabetNextPage(): void {
    if (this.alphabetCurrentPage < this.getAlphabetTotalPages()) this.alphabetCurrentPage++;
  }

  alphabetGoToPage(page: number | string): void {
    if (page === '...') return;
    const pageNum = page as number;
    if (pageNum >= 1 && pageNum <= this.getAlphabetTotalPages()) {
      this.alphabetCurrentPage = pageNum;
    }
  }

  getAlphabetDisplayStart(): number {
    return (this.alphabetCurrentPage - 1) * this.alphabetItemsPerPage + 1;
  }

  getAlphabetDisplayEnd(): number {
    return Math.min(this.alphabetCurrentPage * this.alphabetItemsPerPage, this.filteredAlphabets.length);
  }

  cancelAlphabetEdit(): void {
    this.showAlphabetForm = false;
    this.editingAlphabetId = null;
    this.selectedAlphabetAudioFile = null;
    this.validationErrors = {};
    this.audioFileDeleted = false;
    this.deletedAudioUrl = null;
    this.originalNativePronunciation = null;
    if (this.alphabetAudioPreviewUrl) {
      URL.revokeObjectURL(this.alphabetAudioPreviewUrl);
      this.alphabetAudioPreviewUrl = null;
    }
    this.currentAlphabet = {
      id: 0,
      character: '',
      nativePronunciation: '',
      englishEquivalent: '',
      nativeExample: '',
      englishExample: ''
    };
  }

  // ========== WORD MANAGEMENT ==========

  loadWords(): void {
    this.lessonService.getAllWords().subscribe({
      next: (words) => {
        if (words) {
          this.words = words;
          this.filteredWords = [...this.words];
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load words:', error);
        this.cdr.detectChanges();
      }
    });
  }

  private handlePostSaveActions() {
    this.editingId = null;
    this.resetForm();
    this.showForm = false;
    this.selectedWordAudioFile = null;
    this.wordAudioFileDeleted = false;
    this.wordDeletedAudioUrl = null;
    this.originalWordAudioUrl = null;
    if (this.wordAudioPreviewUrl) {
      URL.revokeObjectURL(this.wordAudioPreviewUrl);
      this.wordAudioPreviewUrl = null;
    }
  }

  async saveWord(): Promise<void> {
    this.validationErrors = {};
    let isValid = true;

    if (!this.currentWord.word.trim()) {
      this.validationErrors.word = 'Word is required';
      isValid = false;
    }

    if (!this.currentWord.translation.trim()) {
      this.validationErrors.translation = 'Translation is required';
      isValid = false;
    }

    if (!isValid) {
      this.cdr.detectChanges();
      return;
    }

    // Don't add deletion flags to wordData - keep it clean for the interface
    const wordData = { ...this.currentWord };

    if (this.editingId !== null) {
      // Pass deletion flags as separate parameters, not in wordData
      this.lessonService.updateWord(
        this.editingId,
        wordData,  // This only contains DictionaryWord properties
        this.selectedWordAudioFile || undefined,
        this.wordAudioFileDeleted,  // Pass deletion flag separately
        this.wordDeletedAudioUrl     // Pass deleted URL separately
      ).subscribe({
        next: () => {
          this.showValidationModalMessage('Word updated successfully!', 'success');
          this.resetWordForm();
          this.loadWords();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Update error:', err);
          this.showValidationModalMessage('Failed to update word.', 'error');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.lessonService.addWord(wordData as DictionaryWord, this.selectedWordAudioFile || undefined).subscribe({
        next: () => {
          this.showValidationModalMessage('Word added successfully!', 'success');
          this.resetWordForm();
          this.loadWords();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Add error:', err);
          this.showValidationModalMessage('Failed to add word.', 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  resetWordForm(): void {
    this.editingId = null;
    this.selectedWordAudioFile = null;
    this.wordAudioFileDeleted = false;
    this.wordDeletedAudioUrl = null;
    this.originalWordAudioUrl = null;
    if (this.wordAudioPreviewUrl) {
      URL.revokeObjectURL(this.wordAudioPreviewUrl);
      this.wordAudioPreviewUrl = null;
    }
  }

  editWord(word: DictionaryWord): void {
    this.currentWord = { ...word };
    this.editingId = word.wordId || null;
    this.showForm = true;
    this.selectedWordAudioFile = null;
    this.wordAudioPreviewUrl = null;
    this.validationErrors = {};

    // Store original audio for deletion tracking
    this.originalWordAudioUrl = word.audioUrl || null;
    this.wordAudioFileDeleted = false;
    this.wordDeletedAudioUrl = null;

    this.cdr.detectChanges();
    this.scrollToWordForm();
  }

  openDeleteModal(id: number | undefined): void {
    if (id) {
      this.pendingDeleteId = id;
      this.showDeleteModal = true;
    } else {
      this.showValidationModalMessage('Cannot delete: Invalid word ID', 'error');
    }
  }

  confirmDelete(): void {
    if (this.pendingDeleteId !== null) {
      this.lessonService.deleteWord(this.pendingDeleteId).subscribe({
        next: () => {
          if (this.editingId === this.pendingDeleteId) {
            this.resetForm();
          }
          this.showValidationModalMessage('Word deleted successfully!', 'success');
          this.closeDeleteModal();
          this.pendingDeleteId = null;
          this.loadWords();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.showValidationModalMessage('Failed to delete word.', 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.pendingDeleteId = null;
  }

  showValidationModalMessage(message: string, type: 'success' | 'error' = 'error'): void {
    this.validationMessage = message;
    this.validationType = type;
    this.showValidationModal = true;
    this.cdr.detectChanges();

    if (type === 'success') {
      setTimeout(() => {
        this.closeValidationModal();
      }, 3000);
    }
  }

  closeValidationModal(): void {
    this.showValidationModal = false;
    this.validationMessage = '';
  }

  filterWords(): void {
    if (!this.searchTerm.trim()) {
      this.filteredWords = [...this.words];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredWords = this.words.filter(word =>
        word.word.toLowerCase().includes(term) ||
        word.translation.toLowerCase().includes(term) ||
        (word.example && word.example.toLowerCase().includes(term))
      );
    }
    this.currentPage = 1;
  }

  resetForm(): void {
    this.currentWord = {
      word: '',
      translation: '',
      example: '',
      exampleTranslation: '',
      audioUrl: ''
    };
    this.editingId = null;
    this.importError = '';
    this.importSuccess = '';
    this.selectedWordAudioFile = null;
    this.validationErrors = {};
    this.wordAudioFileDeleted = false;
    this.wordDeletedAudioUrl = null;
    this.originalWordAudioUrl = null;
    if (this.wordAudioPreviewUrl) {
      URL.revokeObjectURL(this.wordAudioPreviewUrl);
      this.wordAudioPreviewUrl = null;
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.importError = '';
    this.importSuccess = '';
  }

  importFile(): void {
    if (!this.selectedFile) {
      this.showValidationModalMessage('Please select a file', 'error');
      return;
    }

    this.isImporting = true;
    const fileExtension = this.selectedFile.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      this.importExcelFile();
    } else if (fileExtension === 'json') {
      this.importJSONFile();
    } else if (fileExtension === 'csv') {
      this.importCSVFile();
    } else {
      this.isImporting = false;
      this.showValidationModalMessage('Please upload a JSON, CSV, or Excel file (XLS, XLSX)', 'error');
    }
  }

  private importExcelFile(): void {
    if (!this.selectedFile) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        const importedWords: Partial<DictionaryWord>[] = jsonData.map((row: any) => ({
          word: row['Word'] || row['word'] || '',
          translation: row['Translation'] || row['translation'] || '',
          example: row['Example'] || row['example'] || '',
          exampleTranslation: row['Example Translation'] || row['exampleTranslation'] || row['example_translation'] || '',
          audioUrl: ''
        }));
        this.processImportedWords(importedWords);
      } catch (error) {
        this.isImporting = false;
        this.showValidationModalMessage('Error parsing Excel file.', 'error');
      }
    };
    reader.readAsArrayBuffer(this.selectedFile);
  }

  private importJSONFile(): void {
    if (!this.selectedFile) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const importedWords: Partial<DictionaryWord>[] = JSON.parse(e.target.result);
        this.processImportedWords(importedWords);
      } catch (error) {
        this.isImporting = false;
        this.showValidationModalMessage('Error parsing JSON file.', 'error');
      }
    };
    reader.readAsText(this.selectedFile);
  }

  private importCSVFile(): void {
    if (!this.selectedFile) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const importedWords = this.parseCSV(e.target.result);
        this.processImportedWords(importedWords);
      } catch (error) {
        this.isImporting = false;
        this.showValidationModalMessage('Error parsing CSV file.', 'error');
      }
    };
    reader.readAsText(this.selectedFile);
  }

  private processImportedWords(importedWords: Partial<DictionaryWord>[]): void {
    let addedCount = 0;
    let skippedCount = 0;

    importedWords.forEach(importedWord => {
      if (importedWord.word && importedWord.translation) {
        const existingWord = this.words.find(w =>
          w.word.toLowerCase() === importedWord.word!.toLowerCase()
        );
        if (!existingWord) {
          const newWord: DictionaryWord = {
            word: importedWord.word!.trim(),
            translation: importedWord.translation!.trim(),
            example: importedWord.example?.trim() || '',
            exampleTranslation: importedWord.exampleTranslation?.trim() || '',
            audioUrl: ''
          };

          this.lessonService.addWord(newWord).subscribe({
            next: () => {
              addedCount++;
              if (addedCount + skippedCount === importedWords.length) {
                this.finishImport(addedCount, skippedCount);
              }
            },
            error: () => {
              skippedCount++;
              if (addedCount + skippedCount === importedWords.length) {
                this.finishImport(addedCount, skippedCount);
              }
            }
          });
        } else {
          skippedCount++;
          if (addedCount + skippedCount === importedWords.length) {
            this.finishImport(addedCount, skippedCount);
          }
        }
      } else {
        skippedCount++;
        if (addedCount + skippedCount === importedWords.length) {
          this.finishImport(addedCount, skippedCount);
        }
      }
    });

    if (importedWords.length === 0) {
      this.finishImport(0, 0);
    }
  }

  private finishImport(addedCount: number, skippedCount: number): void {
    this.isImporting = false;
    this.selectedFile = null;

    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    let message = `Successfully imported ${addedCount} words!`;
    if (skippedCount > 0) {
      message += ` Skipped ${skippedCount} duplicate words.`;
    }
    message += ` Note: Audio for imported words must be added manually.`;
    this.showValidationModalMessage(message, 'success');
    this.loadWords();
  }

  private parseCSV(csvContent: string): Partial<DictionaryWord>[] {
    const lines = csvContent.split('\n');
    const headers = lines[0].toLowerCase().split(',');
    const wordIndex = headers.findIndex(h => h.includes('word'));
    const translationIndex = headers.findIndex(h => h.includes('translation'));
    const exampleIndex = headers.findIndex(h => h.includes('example'));
    const exampleTransIndex = headers.findIndex(h => h.includes('exampletranslation') || h.includes('example_translation'));
    const results: Partial<DictionaryWord>[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = this.parseCSVLine(lines[i]);
      if (values.length > 0) {
        results.push({
          word: wordIndex !== -1 ? values[wordIndex]?.trim() : '',
          translation: translationIndex !== -1 ? values[translationIndex]?.trim() : '',
          example: exampleIndex !== -1 ? values[exampleIndex]?.trim() : '',
          exampleTranslation: exampleTransIndex !== -1 ? values[exampleTransIndex]?.trim() : '',
          audioUrl: ''
        });
      }
    }
    return results;
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map(field => field.replace(/^"|"$/g, '').trim());
  }

  exportToJSON(): void {
    this.isExporting = true;
    setTimeout(() => {
      const dataStr = JSON.stringify(this.words, null, 2);
      this.downloadFile(dataStr, 'dictionary_export.json', 'application/json');
      this.isExporting = false;
      this.showValidationModalMessage('Successfully exported to JSON!', 'success');
    }, 100);
  }

  exportToCSV(): void {
    this.isExporting = true;
    setTimeout(() => {
      const headers = ['Word', 'Translation', 'Example', 'Example Translation', 'Audio URL'];
      const rows = this.words.map(word => [
        this.escapeCSV(word.word),
        this.escapeCSV(word.translation),
        this.escapeCSV(word.example),
        this.escapeCSV(word.exampleTranslation),
        this.escapeCSV(word.audioUrl || '')
      ]);
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      this.downloadFile(csvContent, 'dictionary_export.csv', 'text/csv');
      this.isExporting = false;
      this.showValidationModalMessage('Successfully exported to CSV!', 'success');
    }, 100);
  }

  exportToExcel(): void {
    this.isExporting = true;
    setTimeout(() => {
      const worksheetData = this.words.map(word => ({
        'Word': word.word,
        'Translation': word.translation,
        'Example': word.example,
        'Example Translation': word.exampleTranslation,
        'Audio URL': word.audioUrl || '',
        'Date Added': word.createdAt ? new Date(word.createdAt).toLocaleDateString() : ''
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dictionary');
      worksheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 40 }, { wch: 40 }, { wch: 30 }, { wch: 15 }];
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'dictionary_export.xlsx';
      link.click();
      URL.revokeObjectURL(url);
      this.isExporting = false;
      this.showValidationModalMessage('Successfully exported to Excel!', 'success');
    }, 100);
  }

  private escapeCSV(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.filterWords();
    this.filterAlphabets();
  }

  cancelEdit(): void {
    this.resetForm();
    this.showForm = false;
    this.selectedWordAudioFile = null;
    this.validationErrors = {};
    this.wordAudioFileDeleted = false;
    this.wordDeletedAudioUrl = null;
    this.originalWordAudioUrl = null;
    if (this.wordAudioPreviewUrl) {
      URL.revokeObjectURL(this.wordAudioPreviewUrl);
      this.wordAudioPreviewUrl = null;
    }
  }

  getPaginatedWords(): DictionaryWord[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredWords.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredWords.length / this.itemsPerPage);
  }

  getPageNumbers(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.currentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  }

  goToPage(page: number | string): void {
    if (page === '...') return;
    const pageNum = page as number;
    if (pageNum >= 1 && pageNum <= this.getTotalPages()) {
      this.currentPage = pageNum;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) this.currentPage++;
  }

  getDisplayStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getDisplayEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredWords.length);
  }
}