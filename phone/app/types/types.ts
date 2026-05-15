export type AlphabetEntry = {
  id: number;
  character: string;
  englishEquivalent: string;
  nativePronunciation?: string;
  nativeExample: string;
  englishExample: string;
};

export type WordEntry = {
  wordId: number;
  word: string;
  translation: string;
  example: string;
  exampleTranslation: string;
  audioUrl?: string;
};