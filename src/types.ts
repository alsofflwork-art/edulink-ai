export type View = 'teacher' | 'student' | 'matrix';
export type AgeMode = 'explorer' | 'scholar';
export type MicStatus = 'connected' | 'charging' | 'syncing';
export type LessonStatus = 'processed' | 'processing' | 'live';
export type Audience = 'explorer' | 'standard' | 'scholar';

export interface SegmentMatch {
  lo: string;
  score: number;
}

export interface TranscriptSegment {
  id: string;
  t: string;
  text: string;
  concepts: string[];
  matches: SegmentMatch[];
}

export interface MatchedObjective {
  id: string;
  text: string;
  covered: boolean;
  score: number;
}

export interface SyllabusMatch {
  code: string;
  chapter: string;
  section: string;
  confidence: number;
  objectives: MatchedObjective[];
}

export interface Lesson {
  id: string;
  classId: string;
  className: string;
  time: string;
  duration: string;
  title: string;
  status: LessonStatus;
  wordCount: number;
  summary: string;
  keyPoints: string[];
  concepts: string[];
  match: SyllabusMatch;
  transcript: TranscriptSegment[];
  hasSyllabusDoc?: boolean;
}

export interface QuizItem {
  id: string;
  type: 'Multiple choice' | 'Short answer' | 'Picture choice' | 'Voice answer' | 'Extended response' | 'Investigation';
  bloom: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate';
  question: string;
  options?: string[];
  answer: string;
  sourceSegment: string;
  objective: string;
  marks?: number;
}
