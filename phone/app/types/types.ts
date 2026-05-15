export type AlphabetEntry = {
  id: string;
  character: string;
  englishEquivalent: string;
  nativePronunciationUri?: string;
  nativeExample: string;
  englishExample: string;
};

export type WordEntry = {
  id: string;
  word: string;
  englishTranslation: string;
  exampleSentence?: string;
  exampleTranslation?: string;
};