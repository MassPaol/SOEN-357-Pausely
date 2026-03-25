import { create } from 'zustand';

type Group = 'control' | 'experimental';

type PromptDecisions = {
  mid: 'continue' | 'exit' | null;
  endSession: 'continue' | 'exit' | null;
  exit: null;
};

type SessionState = {
  participantID: string;
  group: Group | null;
  intendedDuration: number | null;
  sessionStartTime: number | null;
  actualEndTime: number | null;
  postsViewed: number;
  scrollCount: number;
  midSessionEstimate: number | null;
  promptDecisions: PromptDecisions;
  questionnaireResponses: object;
};

type SessionActions = {
  startSession: (intendedDuration: number) => void;
  endSession: () => void;
  incrementPostsViewed: () => void;
  incrementScrollCount: () => void;
  recordPromptDecision: (
    key: keyof Omit<PromptDecisions, 'exit'>,
    value: 'continue' | 'exit',
  ) => void;
  saveQuestionnaireResponse: (responses: object) => void;
  resetSession: () => void;
  setParticipant: (participantID: string, group: Group) => void;
};

const initialState: SessionState = {
  participantID: '',
  group: null,
  intendedDuration: null,
  sessionStartTime: null,
  actualEndTime: null,
  postsViewed: 0,
  scrollCount: 0,
  midSessionEstimate: null,
  promptDecisions: { mid: null, endSession: null, exit: null },
  questionnaireResponses: {},
};

export const useSession = create<SessionState & SessionActions>((set) => ({
  ...initialState,

  startSession: (intendedDuration) =>
    set((state) => ({
      ...initialState,
      participantID: state.participantID, // preserve across sessions
      group: state.group, // preserve across sessions
      intendedDuration,
      sessionStartTime: Date.now(),
    })),

  endSession: () => set({ actualEndTime: Date.now() }),

  incrementPostsViewed: () =>
    set((state) => ({ postsViewed: state.postsViewed + 1 })),

  incrementScrollCount: () =>
    set((state) => ({ scrollCount: state.scrollCount + 1 })),

  recordPromptDecision: (key, value) =>
    set((state) => ({
      promptDecisions: { ...state.promptDecisions, [key]: value },
    })),

  saveQuestionnaireResponse: (responses) =>
    set({ questionnaireResponses: responses }),

  resetSession: () => set(initialState),

  setParticipant: (participantID, group) => set({ participantID, group }),
}));
