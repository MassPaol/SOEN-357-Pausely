import { create } from 'zustand';

type Group = 'control' | 'experimental';

type PromptDecisions = {
  mid: 'continue' | 'exit' | null;
  endSession: 'continue' | 'exit' | null;
  exit: 'continue' | 'exit' | null;
};

type MidSessionGoalStatus = 'yes' | 'not_yet' | 'forgot' | null;
type EndSessionGoalStatus = 'yes' | 'partial' | 'no' | null;
type ExitGoalStatus = 'yes' | 'partial' | 'no' | null;

type SessionState = {
  participantID: string;
  group: Group | null;
  intendedDuration: number | null;
  reasonForSession: string | null;
  sessionStartTime: number | null;
  actualEndTime: number | null;
  pauseStartedAt: number | null;
  totalPausedMs: number;
  postsViewed: number;
  scrollCount: number;
  midPromptShownAt: number | null;
  midSessionEstimate: number | null;
  midSessionGoalStatus: MidSessionGoalStatus;
  midSessionRecall: string | null;
  endSessionGoalStatus: EndSessionGoalStatus;
  endSessionFeeling: string | null;
  exitReason: string | null;
  exitGoalStatus: ExitGoalStatus;
  promptDecisions: PromptDecisions;
  questionnaireResponses: object;
};

type SessionActions = {
  startSession: (intendedDuration: number, reasonForSession: string) => void;
  endSession: () => void;
  incrementPostsViewed: () => void;
  incrementScrollCount: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  recordPromptDecision: (
    key: keyof PromptDecisions,
    value: 'continue' | 'exit',
  ) => void;
  setMidPromptShownAt: (timestamp: number) => void;
  saveMidSessionResponse: (payload: {
    estimateMinutes: number | null;
    goalStatus: MidSessionGoalStatus;
    recall: string | null;
  }) => void;
  saveEndSessionResponse: (payload: {
    goalStatus: EndSessionGoalStatus;
    feeling: string | null;
  }) => void;
  saveExitPromptResponse: (payload: {
    reason: string | null;
    goalStatus: ExitGoalStatus;
  }) => void;
  saveQuestionnaireResponse: (responses: object) => void;
  resetSession: () => void;
  setParticipant: (participantID: string, group: Group) => void;
  setGroup: (group: Group) => void;
};

const initialState: SessionState = {
  participantID: '',
  group: null,
  intendedDuration: null,
  reasonForSession: null,
  sessionStartTime: null,
  actualEndTime: null,
  pauseStartedAt: null,
  totalPausedMs: 0,
  postsViewed: 0,
  scrollCount: 0,
  midPromptShownAt: null,
  midSessionEstimate: null,
  midSessionGoalStatus: null,
  midSessionRecall: null,
  endSessionGoalStatus: null,
  endSessionFeeling: null,
  exitReason: null,
  exitGoalStatus: null,
  promptDecisions: { mid: null, endSession: null, exit: null },
  questionnaireResponses: {},
};

export const useSession = create<SessionState & SessionActions>((set) => ({
  ...initialState,

  startSession: (intendedDuration, reasonForSession) =>
    set((state) => ({
      ...initialState,
      participantID: state.participantID, // preserve across sessions
      group: state.group, // preserve across sessions
      intendedDuration,
      sessionStartTime: Date.now(),
      reasonForSession,
    })),

  endSession: () => set({ actualEndTime: Date.now() }),

  incrementPostsViewed: () =>
    set((state) => ({ postsViewed: state.postsViewed + 1 })),

  incrementScrollCount: () =>
    set((state) => ({ scrollCount: state.scrollCount + 1 })),

  pauseSession: () =>
    set((state) => {
      if (state.pauseStartedAt !== null) {
        return state;
      }

      return { pauseStartedAt: Date.now() };
    }),

  resumeSession: () =>
    set((state) => {
      if (state.pauseStartedAt === null) {
        return state;
      }

      const pausedFor = Date.now() - state.pauseStartedAt;
      return {
        pauseStartedAt: null,
        totalPausedMs: state.totalPausedMs + pausedFor,
      };
    }),

  recordPromptDecision: (key, value) =>
    set((state) => ({
      promptDecisions: { ...state.promptDecisions, [key]: value },
    })),

  setMidPromptShownAt: (timestamp) => set({ midPromptShownAt: timestamp }),

  saveMidSessionResponse: ({ estimateMinutes, goalStatus, recall }) =>
    set({
      midSessionEstimate: estimateMinutes,
      midSessionGoalStatus: goalStatus,
      midSessionRecall: recall,
    }),

  saveEndSessionResponse: ({ goalStatus, feeling }) =>
    set({ endSessionGoalStatus: goalStatus, endSessionFeeling: feeling }),

  saveExitPromptResponse: ({ reason, goalStatus }) =>
    set({ exitReason: reason, exitGoalStatus: goalStatus }),

  saveQuestionnaireResponse: (responses) =>
    set({ questionnaireResponses: responses }),

  resetSession: () => set(initialState),

  setParticipant: (participantID, group) => set({ participantID, group }),

  setGroup: (group) => set({ group }),
}));
