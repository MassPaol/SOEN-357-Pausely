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
  'posts_viewed',
  'scroll_count',
  'mid_prompt_shown_at_ms',
  'mid_prompt_shown_at_iso',
  'mid_session_estimate',
  'mid_session_goal_status',
  'mid_session_recall',
  'prompt_mid_decision',
  'prompt_end_session_decision',
  'prompt_exit_decision',
  'end_session_goal_status',
  'end_session_feeling',
  'exit_reason',
  'exit_goal_status',
  'overrun_duration_ms',
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
  const overrunDuration =
    session.actualEndTime !== null &&
    session.sessionStartTime !== null &&
    session.intendedDuration !== null
      ? session.actualEndTime -
        session.sessionStartTime -
        session.intendedDuration
      : null;

  const row = [
    session.participantID,
    session.group,
    session.intendedDuration,
    session.reasonForSession,
    session.sessionStartTime,
    toIsoString(session.sessionStartTime),
    session.actualEndTime,
    toIsoString(session.actualEndTime),
    session.postsViewed,
    session.scrollCount,
    session.midPromptShownAt,
    toIsoString(session.midPromptShownAt),
    session.midSessionEstimate,
    session.midSessionGoalStatus,
    session.midSessionRecall,
    session.promptDecisions.mid,
    session.promptDecisions.endSession,
    session.promptDecisions.exit,
    session.endSessionGoalStatus,
    session.endSessionFeeling,
    session.exitReason,
    session.exitGoalStatus,
    overrunDuration,
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
