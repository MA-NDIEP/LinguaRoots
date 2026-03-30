export type Word = {
  id: string;
  word: string;
  description: string;
};

export type Section = {
  title: string;
  data: Word[];
};