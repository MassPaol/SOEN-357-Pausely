export type PromptDecisions = {
  mid: 'continue' | 'exit' | null;
  endSession: 'continue' | 'exit' | null;
  exit: 'continue' | 'exit' | null;
};

export type SessionExportData = {
  participantID: string;
  group: string | null;
  intendedDuration: number | null;
  reasonForSession: string | null;
  sessionStartTime: number | null;
  actualEndTime: number | null;
  totalPausedMs: number;
  actualDurationMs: number | null;
  overrunDurationMs: number | null;
  postsViewed: number;
  scrollCount: number;
  midPromptShownAt: number | null;
  midSessionEstimate: number | null;
  midSessionGoalStatus: string | null;
  midSessionRecall: string | null;
  endSessionGoalStatus: string | null;
  endSessionFeeling: string | null;
  exitReason: string | null;
  exitGoalStatus: string | null;
  promptDecisions: PromptDecisions;
  questionnaireResponses: object;
  questionnaireSubmittedAt: number | null;
};

const CSV_HEADERS = [
  'participant_id',
  'group',
  'intended_duration_ms',
  'reason_for_session',
  'session_start_time_ms',
  'session_start_time_iso',
  'actual_end_time_ms',
  'actual_end_time_iso',
  'total_paused_ms',
  'actual_duration_ms',
  'posts_viewed',
  'scroll_count',
  'mid_prompt_shown_at_ms',
  'mid_prompt_shown_at_iso',
  'mid_session_estimate',
  'mid_session_goal_status',
  'mid_session_recall',
  'prompt_mid_decision',
  'prompt_end_session_decision',
  'end_session_goal_status',
  'end_session_feeling',
  'prompt_exit_decision',
  'exit_reason',
  'exit_goal_status',
  'overrun_duration_ms',
  'questionnaire_submitted_at_ms',
  'questionnaire_submitted_at_iso',
  'questionnaire_responses_json',
] as const;

const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;

const formatCsvValue = (value: string | number | null) => {
  if (value === null || value === '') {
    return '""';
  }

  return csvEscape(String(value));
};

const toIsoString = (value: number | null) =>
  value === null ? null : new Date(value).toISOString();

export const buildSessionCsvHeader = () =>
  CSV_HEADERS.map((header) => csvEscape(header)).join(',');

export const buildSessionCsvRow = (session: SessionExportData) => {
  const row = [
    session.participantID,
    session.group,
    session.intendedDuration,
    session.reasonForSession,
    session.sessionStartTime,
    toIsoString(session.sessionStartTime),
    session.actualEndTime,
    toIsoString(session.actualEndTime),
    session.totalPausedMs,
    session.actualDurationMs,
    session.postsViewed,
    session.scrollCount,
    session.midPromptShownAt,
    toIsoString(session.midPromptShownAt),
    session.midSessionEstimate,
    session.midSessionGoalStatus,
    session.midSessionRecall,
    session.promptDecisions.mid,
    session.promptDecisions.endSession,
    session.endSessionGoalStatus,
    session.endSessionFeeling,
    session.promptDecisions.exit,
    session.exitReason,
    session.exitGoalStatus,
    session.overrunDurationMs,
    session.questionnaireSubmittedAt,
    toIsoString(session.questionnaireSubmittedAt),
    JSON.stringify(session.questionnaireResponses),
  ];

  return row.map((value) => formatCsvValue(value)).join(',');
};

export const buildSessionCsv = (session: SessionExportData) => {
  return [buildSessionCsvHeader(), buildSessionCsvRow(session)].join('\n');
};

export const buildSessionCsvFileName = (session: SessionExportData) => {
  const participant = session.participantID.trim() || 'participant';
  const timestamp =
    toIsoString(session.actualEndTime ?? session.sessionStartTime)?.replace(
      /[:.]/g,
      '-',
    ) ?? 'session';

  return `pausely-session-${participant}-${timestamp}.csv`;
};
