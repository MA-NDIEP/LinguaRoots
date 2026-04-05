export type Word = {
  id: string;
  word: string;
  description: string;
};

export type Section = {
  title: string;
  data: Word[];
};

export type PostType = 'IMAGE' | 'VIDEO' | 'TEXT'; // Adjust based on Type.java

export type Comment = {
  commentId: number;
  username: string;
  content: string;
  isLiked: boolean;
  datePublished: string;
};

export type Post = {
  postId: number;
  image?: string;
  video?: string;
  title: string;
  content: string;
  translation: string;
  type: PostType;
  comments?: Comment[];
};

export type LessonType = 'VOCABULARY' | 'GRAMMAR' | 'CULTURE'; // Adjust based on Type.java

export type LessonStatus = 'PUBLISHED' | 'DRAFT'; // Adjust based on Status.java

export type Lesson = {
  lessonId: number;
  type: LessonType;
  title: string;
  content: string;
  pronunciation: string;
  writtenPronunciation: string;
  englishEquivalent: string;
  example: string;
  status: LessonStatus;
};