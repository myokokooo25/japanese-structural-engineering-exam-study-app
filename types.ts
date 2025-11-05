export interface StudyOption {
  id: number;
  textJP: string;
  textMY: string;
}

export interface Explanation {
  titleMY: string;
  reasonMY: string;
  memoryTipMY: string;
}

export interface StudyCardData {
  id: string;
  questionJP: string;
  questionMY: string;
  options: StudyOption[];
  explanation: Explanation;
  correctOptionId: number;
}

export interface User {
  accessKey: string;
}

export interface Kanji {
  character: string;
  meaning: string;
  meaningMY: string;
  onyomi: string;
  kunyomi: string;
}

export type Language = 'jp' | 'my' | 'jp-only';

export interface VocabItem {
  jp: string;
  my: string;
  type: string;
}
