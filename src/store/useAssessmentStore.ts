import { create } from "zustand";
import type {
  UploadStage,
  Question,
  AnswerRegion,
  MappedQuestion,
  GradeResult,
  ExamSummary,
  PageImage,
} from "@/types";

interface AssessmentState {
  stage: UploadStage;
  error: string | null;

  questionPaperFile: File | null;
  answerSheetFile: File | null;

  questionPaperPages: PageImage[];
  answerSheetPages: PageImage[];

  questions: Question[];
  answerRegions: AnswerRegion[];
  mapped: MappedQuestion[];

  grades: Record<string, GradeResult>; // keyed by questionId
  summary: ExamSummary | null;

  selectedQuestionId: string | null;
  currentAnswerPage: number;

  setStage: (stage: UploadStage) => void;
  setError: (error: string | null) => void;
  setQuestionPaperFile: (file: File | null) => void;
  setAnswerSheetFile: (file: File | null) => void;
  setQuestionPaperPages: (pages: PageImage[]) => void;
  setAnswerSheetPages: (pages: PageImage[]) => void;
  setQuestions: (questions: Question[]) => void;
  setAnswerRegions: (regions: AnswerRegion[]) => void;
  setMapped: (mapped: MappedQuestion[]) => void;
  setGrade: (questionId: string, result: GradeResult) => void;
  setSummary: (summary: ExamSummary | null) => void;
  selectQuestion: (questionId: string | null) => void;
  setCurrentAnswerPage: (page: number) => void;
  reset: () => void;
}

const initialState = {
  stage: "idle" as UploadStage,
  error: null,
  questionPaperFile: null,
  answerSheetFile: null,
  questionPaperPages: [],
  answerSheetPages: [],
  questions: [],
  answerRegions: [],
  mapped: [],
  grades: {},
  summary: null,
  selectedQuestionId: null,
  currentAnswerPage: 1,
};

export const useAssessmentStore = create<AssessmentState>((set) => ({
  ...initialState,

  setStage: (stage) => set({ stage }),
  setError: (error) => set({ error, stage: error ? "error" : "idle" }),
  setQuestionPaperFile: (file) => set({ questionPaperFile: file }),
  setAnswerSheetFile: (file) => set({ answerSheetFile: file }),
  setQuestionPaperPages: (pages) => set({ questionPaperPages: pages }),
  setAnswerSheetPages: (pages) => set({ answerSheetPages: pages }),
  setQuestions: (questions) => set({ questions }),
  setAnswerRegions: (regions) => set({ answerRegions: regions }),
  setMapped: (mapped) => set({ mapped }),
  setGrade: (questionId, result) =>
    set((s) => ({ grades: { ...s.grades, [questionId]: result } })),
  setSummary: (summary) => set({ summary }),
  selectQuestion: (questionId) =>
    set((s) => {
      if (!questionId) return { selectedQuestionId: null };
      const match = s.mapped.find((m) => m.question.questionId === questionId);
      const firstRegionPage = match?.regions[0]?.page;
      return {
        selectedQuestionId: questionId,
        currentAnswerPage: firstRegionPage ?? s.currentAnswerPage,
      };
    }),
  setCurrentAnswerPage: (page) => set({ currentAnswerPage: page }),
  reset: () => set(initialState),
}));
