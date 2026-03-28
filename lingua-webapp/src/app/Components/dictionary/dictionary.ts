import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../side-bar/side-bar';
import { NavbarComponent } from '../nav-bar/nav-bar';
import * as XLSX from 'xlsx';

export interface DictionaryWord {
  id?: number;
  word: string;
  translation: string;
  example: string;
  exampleTranslation: string;
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
  words: DictionaryWord[] = [];
  filteredWords: DictionaryWord[] = [];
  
  // Form model for adding/editing words
  currentWord: DictionaryWord = {
    word: '',
    translation: '',
    example: '',
    exampleTranslation: ''
  };
  
  editingId: number | null = null;
  searchTerm: string = '';
  showForm: boolean = false;
  
  // File import
  selectedFile: File | null = null;
  importError: string = '';
  importSuccess: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  // Modal properties
  showDeleteModal: boolean = false;
  showValidationModal: boolean = false;
  validationMessage: string = '';
  validationType: 'success' | 'error' = 'error';
  pendingDeleteId: number | null = null;
  
  // Import/Export loading states
  isImporting: boolean = false;
  isExporting: boolean = false;
  
  ngOnInit(): void {
    this.loadWords();
  }
  
  // Load words from localStorage (you can replace with API call)
  loadWords(): void {
    const savedWords = localStorage.getItem('dictionary_words');
    if (savedWords) {
      this.words = JSON.parse(savedWords);
      this.filteredWords = [...this.words];
    }
  }
  
  // Save words to localStorage (replace with API call)
  saveWords(): void {
    localStorage.setItem('dictionary_words', JSON.stringify(this.words));
    this.filterWords();
  }
  
  // Add or update word
  saveWord(): void {
    if (!this.currentWord.word.trim() || !this.currentWord.translation.trim()) {
      this.showValidationModalMessage('Please fill in at least the word and translation', 'error');
      return;
    }
    
    if (this.editingId !== null) {
      // Update existing word
      const index = this.words.findIndex(w => w.id === this.editingId);
      if (index !== -1) {
        this.words[index] = { ...this.currentWord, id: this.editingId };
      }
      this.editingId = null;
      this.showValidationModalMessage('Word updated successfully!', 'success');
    } else {
      // Add new word
      const newWord: DictionaryWord = {
        ...this.currentWord,
        id: Date.now(),
        createdAt: new Date()
      };
      this.words.push(newWord);
      this.showValidationModalMessage('Word added successfully!', 'success');
    }
    
    this.saveWords();
    this.resetForm();
    this.showForm = false;
  }
  
  // Edit word
  editWord(word: DictionaryWord): void {
    this.currentWord = { ...word };
    this.editingId = word.id || null;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Open delete confirmation modal
  openDeleteModal(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }
  
  // Confirm delete
  confirmDelete(): void {
    if (this.pendingDeleteId !== null) {
      this.words = this.words.filter(w => w.id !== this.pendingDeleteId);
      this.saveWords();
      if (this.editingId === this.pendingDeleteId) {
        this.resetForm();
      }
      this.showValidationModalMessage('Word deleted successfully!', 'success');
      this.closeDeleteModal();
    }
  }
  
  // Close delete modal
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.pendingDeleteId = null;
  }
  
  // Show validation modal
  showValidationModalMessage(message: string, type: 'success' | 'error' = 'error'): void {
    this.validationMessage = message;
    this.validationType = type;
    this.showValidationModal = true;
    
    // Auto close success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        this.closeValidationModal();
      }, 3000);
    }
  }
  
  // Close validation modal
  closeValidationModal(): void {
    this.showValidationModal = false;
    this.validationMessage = '';
  }
  
  // Filter words based on search
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
  
  // Reset form
  resetForm(): void {
    this.currentWord = {
      word: '',
      translation: '',
      example: '',
      exampleTranslation: ''
    };
    this.editingId = null;
    this.importError = '';
    this.importSuccess = '';
  }
  
  // Handle file selection
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.importError = '';
    this.importSuccess = '';
  }
  
  // Import words from file
  importFile(): void {
    if (!this.selectedFile) {
      this.showValidationModalMessage('Please select a file', 'error');
      return;
    }
    
    this.isImporting = true;
    const fileExtension = this.selectedFile.name.split('.').pop()?.toLowerCase();
    
    // Handle Excel files
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      this.importExcelFile();
    } 
    // Handle JSON files
    else if (fileExtension === 'json') {
      this.importJSONFile();
    } 
    // Handle CSV files
    else if (fileExtension === 'csv') {
      this.importCSVFile();
    } 
    else {
      this.isImporting = false;
      this.showValidationModalMessage('Please upload a JSON, CSV, or Excel file (XLS, XLSX)', 'error');
    }
  }
  
  // Import Excel file
  private importExcelFile(): void {
    if (!this.selectedFile) {
      this.isImporting = false;
      return;
    }
    
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
          exampleTranslation: row['Example Translation'] || row['exampleTranslation'] || row['example_translation'] || ''
        }));
        
        this.processImportedWords(importedWords);
      } catch (error) {
        this.isImporting = false;
        this.showValidationModalMessage('Error parsing Excel file. Please check the format.', 'error');
        console.error(error);
      }
    };
    
    reader.readAsArrayBuffer(this.selectedFile);
  }
  
  // Import JSON file
  private importJSONFile(): void {
    if (!this.selectedFile) {
      this.isImporting = false;
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      try {
        const importedWords: Partial<DictionaryWord>[] = JSON.parse(e.target.result);
        this.processImportedWords(importedWords);
      } catch (error) {
        this.isImporting = false;
        this.showValidationModalMessage('Error parsing JSON file. Please check the format.', 'error');
        console.error(error);
      }
    };
    
    reader.readAsText(this.selectedFile);
  }
  
  // Import CSV file
  private importCSVFile(): void {
    if (!this.selectedFile) {
      this.isImporting = false;
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      try {
        const csvContent = e.target.result;
        const importedWords = this.parseCSV(csvContent);
        this.processImportedWords(importedWords);
      } catch (error) {
        this.isImporting = false;
        this.showValidationModalMessage('Error parsing CSV file. Please check the format.', 'error');
        console.error(error);
      }
    };
    
    reader.readAsText(this.selectedFile);
  }
  
  // Process imported words
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
            id: Date.now() + Math.random(),
            word: importedWord.word!.trim(),
            translation: importedWord.translation!.trim(),
            example: importedWord.example?.trim() || '',
            exampleTranslation: importedWord.exampleTranslation?.trim() || '',
            createdAt: new Date()
          };
          this.words.push(newWord);
          addedCount++;
        } else {
          skippedCount++;
        }
      }
    });
    
    this.saveWords();
    this.isImporting = false;
    this.selectedFile = null;
    
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    let message = `Successfully imported ${addedCount} words!`;
    if (skippedCount > 0) {
      message += ` Skipped ${skippedCount} duplicate words.`;
    }
    this.showValidationModalMessage(message, 'success');
  }
  
  // Parse CSV file
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
          exampleTranslation: exampleTransIndex !== -1 ? values[exampleTransIndex]?.trim() : ''
        });
      }
    }
    
    return results;  
  }
  
  // Parse CSV line handling quotes
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
  
  // Export words to JSON
  exportToJSON(): void {
    this.isExporting = true;
    setTimeout(() => {
      const dataStr = JSON.stringify(this.words, null, 2);
      this.downloadFile(dataStr, 'dictionary_export.json', 'application/json');
      this.isExporting = false;
      this.showValidationModalMessage('Successfully exported to JSON!', 'success');
    }, 100);
  }
  
  // Export words to CSV
  exportToCSV(): void {
    this.isExporting = true;
    setTimeout(() => {
      const headers = ['Word', 'Translation', 'Example', 'Example Translation'];
      const rows = this.words.map(word => [
        this.escapeCSV(word.word),
        this.escapeCSV(word.translation),
        this.escapeCSV(word.example),
        this.escapeCSV(word.exampleTranslation)
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      this.downloadFile(csvContent, 'dictionary_export.csv', 'text/csv');
      this.isExporting = false;
      this.showValidationModalMessage('Successfully exported to CSV!', 'success');
    }, 100);
  }
  
  // Export words to Excel (XLSX)
  exportToExcel(): void {
    this.isExporting = true;
    setTimeout(() => {
      const worksheetData = this.words.map(word => ({
        'Word': word.word,
        'Translation': word.translation,
        'Example': word.example,
        'Example Translation': word.exampleTranslation,
        'Date Added': word.createdAt ? new Date(word.createdAt).toLocaleDateString() : ''
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dictionary');
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 20 }, // Word
        { wch: 20 }, // Translation
        { wch: 40 }, // Example
        { wch: 40 }, // Example Translation
        { wch: 15 }  // Date Added
      ];
      
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
  }
  
  cancelEdit(): void {
    this.resetForm();
    this.showForm = false;
  }
  
  // Pagination methods
  getPaginatedWords(): DictionaryWord[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredWords.slice(startIndex, endIndex);
  }
  
  getTotalPages(): number {
    return Math.ceil(this.filteredWords.length / this.itemsPerPage);
  }
  
  getPageNumbers(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.currentPage;
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }
  
  getDisplayStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  
  getDisplayEnd(): number {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.filteredWords.length);
  }
}